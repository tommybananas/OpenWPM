/**
 * Kill the current tab and create a new one to stop traffic.
 */
function tab_restart_browser() {
    var current_url = window.location.href;
    window.close();
    window.open(current_url);
}

function browser_scroll(x_coord, y_coord) {
    window.scrollTo(x_coord, y_coord)
}

function listCookies() {
    return document.cookie.split(';');
}

function get_links_in_current_window() {
    var link_list = [];
    var links = document.links;
    for(var i = 0; i < links.length; i++) {
        link_list.push(links[i].href)
    }
    return link_list
}

function dump_page_source(url) {
    return document.documentElement.outerHTML
}


function getSettings(){
  return [true, true, true];
}

function reportJs(obj){
  console.log('reportjs', obj);
  socket.emit('sql', { data: obj, type: 'js' });
  return true;
}

function reportProfile(obj){
  console.log('reportprofile', obj);
  socket.emit('sql', { data: obj, type: 'cp' });
  return true;
}

function reportCookies(obj){
  //console.log('reportcookies', JSON.stringify(obj));
  socket.emit('sql', { data: obj, type: 'ck' });
  return true;
}

if (getSettings()[0]){
    chrome.cookies.onChanged.addListener(function(info){
        reportCookies(info);
    })
}


if (getSettings()[1]) {


    chrome.webRequest.onCompleted.addListener(
        function(details) {
          reportProfile(details);
        },
        {urls: ["<all_urls>"]});
}

if (getSettings()[2]) {
    chrome.runtime.onConnect.addListener(function(port) {
        console.assert(port.name == "javascriptMsg");
        port.onMessage.addListener(function(msg) {
            reportJs(msg);
        });
    });
}


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "request_settings")
      sendResponse({settings: getSettings()});
  });



  var socket = io('http://localhost:7331/openwpm');
  socket.on('config', function (data) {
    console.log('config data',data);
  });
  function startSocketServer(){
    socket.emit('sql', { data: 'tab opened' });
  }
  chrome.tabs.onCreated.addListener(startSocketServer);
