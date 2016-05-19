const {Cc, Ci, CC, Cu} = require("chrome");
var events = require("sdk/system/events");
const data = require("sdk/self").data;
var loggingDB = require("./loggingdb.js");
var timers = require("sdk/timers");
var pageManager = require("./page-manager.js");
Cu.import('resource://gre/modules/Services.jsm');

var BinaryInputStream = CC('@mozilla.org/binaryinputstream;1', 'nsIBinaryInputStream', 'setInputStream');
var BinaryOutputStream = CC('@mozilla.org/binaryoutputstream;1', 'nsIBinaryOutputStream', 'setOutputStream');
var StorageStream = CC('@mozilla.org/storagestream;1', 'nsIStorageStream', 'init');

exports.run = function(crawlID) {
	// Set up logging
	var createHttpRequestTable = data.load("create_http_requests_table.sql");
	loggingDB.executeSQL(createHttpRequestTable, false);
	
	var createHttpResponseTable = data.load("create_http_responses_table.sql");
	loggingDB.executeSQL(createHttpResponseTable, false);

	// Instrument HTTP requests
	events.on("http-on-modify-request", function(event) {
		var httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);
		
		// http_requests table schema:
		// id [auto-filled], crawl_id, url, method, referrer, 
		// headers, visit_id [auto-filled], time_stamp
		var update = {};
		
		update["crawl_id"] = crawlID;

		var url = httpChannel.URI.spec;
		update["url"] = loggingDB.escapeString(url);
		
		var requestMethod = httpChannel.requestMethod;
		update["method"] = loggingDB.escapeString(requestMethod);
		
		var referrer = "";
		if(httpChannel.referrer)
			referrer = httpChannel.referrer.spec;
		update["referrer"] = loggingDB.escapeString(referrer);
		
		var current_time = new Date();
		update["time_stamp"] = current_time.toISOString();	
		
		var headers = [];
		httpChannel.visitRequestHeaders({visitHeader: function(name, value) {
			var header_pair = [];
			header_pair.push(loggingDB.escapeString(name));
			header_pair.push(loggingDB.escapeString(value));
			headers.push(header_pair);
		}});
		update["headers"] = JSON.stringify(headers);

		loggingDB.executeSQL(loggingDB.createInsert("http_requests", update), true);

	}, true);
		
	
	function TracingListener() {
		this.receivedChunks = []; // array for incoming data. onStopRequest we combine these to get the full source
		this.responseBody;
		this.responseStatusCode;

		this.deferredDone = {
			promise: null,
			resolve: null,
			reject: null
		};
		this.deferredDone.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this.deferredDone));
		Object.freeze(this.deferredDone);
		this.promiseDone = this.deferredDone.promise;
	}
	TracingListener.prototype = {
		onDataAvailable: function(aRequest, aContext, aInputStream, aOffset, aCount) {
			var iStream = new BinaryInputStream(aInputStream) // binaryaInputStream
			var sStream = new StorageStream(8192, aCount, null);
			var oStream = new BinaryOutputStream(sStream.getOutputStream(0));

			// Copy received data as they come.
			var data = iStream.readBytes(aCount);
			this.receivedChunks.push(data);
			oStream.writeBytes(data, aCount);

			this.originalListener.onDataAvailable(aRequest, aContext, sStream.newInputStream(0), aOffset, aCount);
		},
		onStartRequest: function(aRequest, aContext) {
			this.originalListener.onStartRequest(aRequest, aContext);
		},
		onStopRequest: function(aRequest, aContext, aStatusCode) {
			this.responseBody = this.receivedChunks.join("");
			delete this.receivedChunks;
			this.responseStatus = aStatusCode;

			this.originalListener.onStopRequest(aRequest, aContext, aStatusCode);
			this.deferredDone.resolve();
		},
		QueryInterface: function(aIID) {
			if (aIID.equals(Ci.nsIStreamListener) || aIID.equals(Ci.nsISupports)) {
				return this;
			}
			throw Cr.NS_NOINTERFACE;
		}
	};

	// Instrument HTTP responses
	var httpResponseHandler = function(event, isCached) {	
		var httpChannel = event.subject.QueryInterface(Ci.nsIHttpChannel);

		// http_responses table schema:
		// id [auto-filled], crawl_id, url, method, referrer, response_status,
		// response_status_text, headers, location, visit_id [auto-filled],
		// time_stamp, content_hash		
		var update = {};

		update["crawl_id"] = crawlID;
		
		var url = httpChannel.URI.spec;
		update["url"] = loggingDB.escapeString(url);
		
		var requestMethod = httpChannel.requestMethod;
		update["method"] = loggingDB.escapeString(requestMethod);
		
		var referrer = "";
		if(httpChannel.referrer)
			referrer = httpChannel.referrer.spec;
		update["referrer"] = loggingDB.escapeString(referrer);
		
		var responseStatus = httpChannel.responseStatus;
		update["response_status"] = responseStatus;
		
		var responseStatusText = httpChannel.responseStatusText;
		update["response_status_text"] = loggingDB.escapeString(responseStatusText);
				
		// TODO: add "is_cached" boolean?

		var current_time = new Date();
		update["time_stamp"] = current_time.toISOString();	
		
		var location = "";
		try {
			location = httpChannel.getResponseHeader("location");
		}
		catch (e) {
			location = "";
		}
		update["location"] = location;

		var headers = [];
		httpChannel.visitResponseHeaders({visitHeader: function(name, value) {
			var header_pair = [];
			header_pair.push(loggingDB.escapeString(name));
			header_pair.push(loggingDB.escapeString(value));
			headers.push(header_pair);
		}});		
		update["headers"] = JSON.stringify(headers);

		var newListener = new TracingListener();
		event.subject.QueryInterface(Ci.nsITraceableChannel);
		newListener.originalListener = event.subject.setNewListener(newListener);
		newListener.promiseDone.then(
			function() {
				// no error happened
				update["content_hash"] = "testing";
				loggingDB.executeSQL(loggingDB.createInsert("http_responses", update), true); 

			},
			function(aReason) {
				// promise was rejected
			}
		).catch(
			function(aCatch) {
				console.error('something went wrong, a typo by dev probably:', aCatch);
			}
		);
			
		
	};
	
	events.on("http-on-examine-response", function(event) {
		httpResponseHandler(event, false);
	}, true);
	
	// Instrument cached HTTP responses
	events.on("http-on-examine-cached-response", function(event) {
		httpResponseHandler(event, true);
	}, true);
	
};