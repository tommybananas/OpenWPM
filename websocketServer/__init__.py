import socketio
import eventlet
import eventlet.wsgi
import threading

def startSocketServer():
    sio = socketio.Server(async_mode='eventlet')
    @sio.on('connect', namespace='/chat')
    def connect(sid, environ):
        print("connect ", sid)
        print("connect")

    @sio.on('message', namespace='/chat')
    def message(sid, data):
        print("message ", data)
        sio.emit('reply', room=sid)

    @sio.on('disconnect', namespace='/chat')
    def disconnect(sid):
        print('disconnect ', sid)

    wst = threading.Thread(target=serve, args=(sio,))
    wst.daemon = True
    wst.start()


def serve(_sio):
    try:
        # Silence repeated socket attempts
        app = socketio.Middleware(_sio)
        eventlet.wsgi.server(eventlet.listen(('', 7331)), app, log_output=False)
    except:
        pass


if __name__ == '__main__':
    startSocketServer()
    startSocketServer()