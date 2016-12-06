var socket = io('http://localhost:7331/chat');
function startSocketServer(){
  socket.emit('message', { my: 'data MY MESSAGE' });
  socket.on('news', function (data) {
    console.log(data);
    socket.emit('message', { my: 'data MY MESSAGE' });
  });
}

chrome.tabs.onCreated.addListener(startSocketServer);
