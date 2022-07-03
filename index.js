const express=require('express');
const app = new express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;
var ss = require('socket.io-stream');
app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('join room', (datas) => {
    datas["sid"]=socket.id
    datas["msg"]=datas.name+"加入房间"
    socket.join(datas.linkcode);
    io.to(datas.linkcode).emit('notice',datas);
  });

  socket.on('send message', (datas) => {
    io.to(datas.linkcode).emit('send message',datas);
  });

  ss(socket).on('file', function(stream, datas) {
    var outgoingstream = ss.createStream();
    ss(io).emit('file', outgoingstream, datas);
    stream.pipe(outgoingstream)
  });

});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});