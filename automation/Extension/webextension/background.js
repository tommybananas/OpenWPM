chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});

/**
 * Kill the current tab and create a new one to stop traffic.
 */
function tab_restart_browser() {
    var current_url = window.location.href;
    window.close();
    window.open(current_url);
}

function browser_scroll(x-coord, y-coord) {
    window.scrollTo(x-coord, y-coord)
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
  return true;
}

function reportProfile(obj){
  console.log('reportprofile', obj);
  return true;
}

function reportCookies(obj){
  console.log('reportcookies', obj);
  return true;
}

function
