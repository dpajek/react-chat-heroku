import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";

import "./App.css";

const ENDPOINT = "/";
let socket;

function App() {
  const [chats, setChats] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    console.log("useEffect called to setup");
    socket = socketIOClient(ENDPOINT);

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    console.log("useEffect called to receive message");

    socket.on("chat message", (data) => {
      console.log("chat from server: " + data);
      //console.log(chats);
      setChats((chats) => chats + " " + data);
    });
  }, []);

  function newChatMessage(e) {
    e.preventDefault();

    console.log("newChatMessage: " + currentMessage);
    socket.emit("chat message", currentMessage);
    setCurrentMessage("");
  }

  function onChangeCurrentMessage(e) {
    setCurrentMessage(e.target.value);
  }

  return (
    <div className="App">
      {chats}
      <div className="form">
        <input
          type="text"
          className="currentMessage"
          value={currentMessage}
          onChange={onChangeCurrentMessage}
          onKeyPress={e => e.key === 'Enter' ? newChatMessage(e) : null }
          autoComplete="off"
        />
        <button onClick={(e) => newChatMessage(e)}>Send</button>
      </div>
    </div>
  );
}

export default App;
