module.exports = (app) => {
  var server = require("http").Server(app);
  var io = require("socket.io")(server);

  io.on("connection", (socket) => {
    console.log("a user connection!!!");
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });

  app.get('/chat', (req, res) => {
    res.render('chat/index');
  })
}
