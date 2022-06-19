const express=require('express');
const app = new express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

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
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});