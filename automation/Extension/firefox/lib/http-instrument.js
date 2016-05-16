const {Cc, Ci} = require("chrome");
var events = require("sdk/system/events");
const data = require("sdk/self").data;
var loggingDB = require("./loggingdb.js");
var timers = require("sdk/timers");
var pageManager = require("./page-manager.js");

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

		loggingDB.executeSQL(loggingDB.createInsert("http_responses", update), true);
	};
	
	events.on("http-on-examine-response", function(event) {
		httpResponseHandler(event, false);
	}, true);
	
	// Instrument cached HTTP responses
	events.on("http-on-examine-cached-response", function(event) {
		httpResponseHandler(event, true);
	}, true);

};