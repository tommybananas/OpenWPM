import socketio
import eventlet
import eventlet.wsgi
import threading


class SocketServer:

    def __init__(self):
        self.sio = socketio.Server(async_mode='eventlet')

    def startServer(self):
        @self.sio.on('connect', namespace='/chat')
        def connect(sid, environ):
            print("connect ", sid)
            print("connect")

        @self.sio.on('message', namespace='/chat')
        def message(sid, data):
            print("message ", data)
            self.sio.emit('reply', room=sid)

        @self.sio.on('disconnect', namespace='/chat')
        def disconnect(sid):
            print('disconnect ', sid)


        wst = threading.Thread(target=self.serve, args=(self.sio,))
        # wst.daemon = True
        wst.start()


    def serve(self, _sio):
        app = socketio.Middleware(_sio)
        eventlet.wsgi.server(eventlet.listen(('', 7331)), app, log_output=False)
        print('SocketIO server started on port 7331')


if __name__ == '__main__':
    ss = SocketServer()
    ss.startServer()
