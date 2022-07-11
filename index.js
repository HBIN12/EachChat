const express = require('express');
const app = new express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;
const fs = require('fs')
var ss = require('socket.io-stream');
var path = require('path');
const { v4: uuidv4 } = require('uuid');
app.use(express.static('public'));
//设置上传的目录，  
var multer = require('multer');
var uploadpath = path.join(__dirname, './uploadfile/')
var upload = multer({ dest: uploadpath });

io.on('connection', (socket) => {
  socket.on('join room', (datas) => {
    datas["sid"] = socket.id
    datas["msg"] = datas.name + "加入房间"
    socket.join(datas.linkcode);
    io.to(datas.linkcode).emit('notice', datas);
  });

  socket.on('send message', (datas) => {
    io.to(datas.linkcode).emit('send message', datas);
  });

  socket.on('file', (datas) => {
    io.to(datas.linkcode).emit('file', datas);
  });

  // // send data
  // ss(socket).on('file', function (stream, datas) {
  //   var uuid = uuidv4();
  //   stream.pipe(fs.createWriteStream("./uploadfile/" + datas.filename));

  //   datas['uuid'] = uuid
  //   io.to(datas.linkcode).emit('file', datas);
  //   console.log(datas)
  //   //   setTimeout(function(){
  //   //     fs.unlinkSync("./uploadfile/"+datas.filename)
  //   //    //延迟15分钟执行
  //   //    },60000)
  // });

});

// app.get("/download", function (req, res) {
//   res.download("./uploadfile/" + req.query.filename)
// })

//上传文件
app.post("/uploadfile", upload.single("file"), async function (req, res) {
  try {
      var file = req.file;
      var filename = file.originalname;
      var uuid = uuidv4();
          //修改文件名
      fs.renameSync(uploadpath + file.filename, uploadpath + uuid);      
      res.json({ "code": 1, "msg": "上传成功" ,"filename":filename,"uuid":uuid})
      setTimeout(function(){
        try {
          fs.unlinkSync(uploadpath + uuid)
        } catch (error) {
        }
           },300000)
  }
  catch (e) {
      console.log(e);
      res.json({ "code": 0, "msg": "上传失败" })
  }

});

//下载文件
app.get("/download", async function (req, res) {
  try {
    res.download(uploadpath+req.query.uuid,req.query.filename);
  } catch (error) {
      console.log(error);
      res.json({ "code": "0", "msg": "下载失败" });
  }
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});