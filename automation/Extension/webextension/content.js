console.log('made it!');

chrome.runtime.sendMessage({greeting: "request_settings"}, function(response) {
    console.log(response.settings);
    settings = response.settings;
    go(settings);
});

function go(settings){
   if(settings[0]){
        chrome.cookies.onChanged.addListener(cookies_changed);

    }
    if(settings[1]){

    }
    if(settings[2]){
    }

}


function cookies_changed(removed,cookie,cause){
    console.log("Cookies changed "+cause);
}

