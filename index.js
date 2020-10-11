const express = require("express");
const path = require("path");

const app = express();

const http = require("http").createServer(app);

const socketio = require("socket.io");
const io = socketio(http);

// Serve static React app at route directory of server
// app.use is the middleware and applies to all, independent of call
// points to this folder for static files

// I think this is necessary if other files are needed (maybe images? css?)
//app.use(express.static(path.join(__dirname, "client/build")));

// list for connection event
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", (msg) => {
    console.log("server - chat message: " + msg);
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.get("/hello-world", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// I think this is needed on server to serve React file
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
http.listen(port);

console.log(`React Cloud Chat listening on ${port}`);
