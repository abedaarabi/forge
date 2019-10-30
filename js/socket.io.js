// var server = app.listen(PORT, () => {
//   console.log(`Server listening on port ${PORT}`);

//   var io = require("socket.io").listen(server);
//   io.on("connection", function(socket) {
//     // any custom action here?

//     socket.on("disconnect", function() {
//       // Any custom action?
//     });

//     socket.on("join", function(data) {
//       socket.join(data.modelView);
//     });

//     socket.on("leave", function(data) {
//       socket.leave(data.modelView);
//     });

//     socket.on("statechanged", function(data) {
//       socket.to(data.modelView).emit("newstate", data.state);
//     });
//   });
// });
