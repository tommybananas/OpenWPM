chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});

function browser_scroll(x-coord, y-coord) {
    window.scrollTo(x-coord, y-coord)
}

function listCookies() {
    return document.cookie.split(';');
}

function close_window() {
    window.close();
}

function open_new_window(url) {
    window.open(url);
}

function tab_restart_browser() {
    var current_url = window.location.href
    close_window()
    open_new_window(current_url)
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
