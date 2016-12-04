console.log('made it!');

chrome.runtime.sendMessage({greeting: "request_settings"}, function(response) {
    console.log(response.settings);
    settings = response.settings;
    go(settings);
});

function go(settings){
   if(settings[0]){
    console.log("Gonna run the 1rd test homie");

    }
    if(settings[1]){
        console.log("Gonna run the 2rd test homie");

    }
    if(settings[2]){
        console.log("Gonna run the 3rd test homie");
    }

}

