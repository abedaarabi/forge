const path = require("path");
const express = require("express");
let app = express();

const PORT = process.env.PORT || 3000;
const config = require("./config");
if (
  config.credentials.client_id == null ||
  config.credentials.client_secret == null
) {
  console.error(
    "Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables."
  );
  return;
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "50mb" }));
app.use("/api/forge/oauth", require("./routes/oauth"));
app.use("/api/forge/oss", require("./routes/oss"));
app.use("/api/forge/modelderivative", require("./routes/modelderivative"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode).json(err);
});

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = require("socket.io").listen(server);
setupSocket();

/************************************************ */

function setupSocket() {
  console.log(`socket listening on port ${PORT}`);
  io.on("connection", function(socket) {
    // any custom action here?

    socket.on("disconnect", function() {
      // Any custom action?
    });

    socket.on("join", function(data) {
      console.log("a new client joined");
      socket.join(data.modelView);
    });

    socket.on("leave", function(data) {
      console.log("client left");
      socket.leave(data.modelView);
    });

    socket.on("statechanged", function(data) {
      console.log("client state changed");
      socket.to(data.modelView).emit("newstate", data.state);
    });
  });
}
