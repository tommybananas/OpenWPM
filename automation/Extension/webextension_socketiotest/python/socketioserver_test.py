import socketio
import eventlet
import eventlet.wsgi

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

app = socketio.Middleware(sio)
eventlet.wsgi.server(eventlet.listen(('', 7331)), app, log_output=False)
