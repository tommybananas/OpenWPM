function startSocketServer(){
  var socket = io('http://localhost:7331/chat');
  socket.emit('message', { my: 'data MY MESSAGE' });
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('message', { my: 'data MY MESSAGE' });
  });
}

chrome.app.runtime.onLaunched.addListener(startSocketServer);