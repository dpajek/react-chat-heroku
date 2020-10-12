const express = require("express");
const path = require("path");

const app = express();

const http = require("http").createServer(app);

const socketio = require("socket.io");
const io = socketio(http);

const users = [];
// fill with a user/room when joins; make function to lookup room of current user; if there's a room, then only broadcast to that room

// Serve static React app at route directory of server
// app.use is the middleware and applies to all, independent of call method
// The React app won't function properly without this
app.use(express.static(path.join(__dirname, "client/build")));

// list for connection event
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("chat message", (msg, callback) => {
    const numberOfRooms = Object.keys(socket.rooms).length; // note includes a room with the socket.id

    if (numberOfRooms <= 1) {
      console.log(`${socket.id} is not in a room!`);
      callback(false);
    } else {
      for (currentRoom in socket.rooms)
        if (currentRoom != socket.id) {
          console.log(
            `Chat Message -from: ${socket.id} -message: ${msg} -room: ${currentRoom}`
          );
          socket.broadcast.to(currentRoom).emit("chat message", msg);
        }
      callback(true);
    }

    // emit to everyone except sender
    //socket.broadcast.emit("chat message", msg);
    // emit to everyone, including sender
    //io.emit("chat message", msg);
  });

  socket.on("join", (room) => {
    const numberOfRooms = Object.keys(socket.rooms).length; // note includes a room with the socket.id

    if (numberOfRooms > 1)
      for (currentRoom in socket.rooms)
        if (currentRoom != socket.id) {
          console.log(`${socket.id} left room: ${currentRoom}`);
          socket.leave(currentRoom);
        }

    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);

    socket.emit("chat message", `Welcome to room ${room}`);
    socket.broadcast
      .to(room)
      .emit("chat message", `${socket.id} is joining room ${room}`);
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
// Note: without this, the root will serve index.html by default
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
http.listen(port);

console.log(`React Cloud Chat listening on ${port}`);
