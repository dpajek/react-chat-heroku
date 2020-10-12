import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

import ScrollToBottom from "react-scroll-to-bottom";

import "./App.css";

const ENDPOINT = "/"; // needs a proxy to node server (this approach avoids CORS issues in browser)

function App() {
  const [chats, setChats] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [roomNameText, setRoomNameText] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const refSocket = useRef(null);

  useEffect(() => {
    console.log("useEffect called to setup socket");
    refSocket.current = socketIOClient(ENDPOINT);

    return () => refSocket.current.disconnect();
  }, []);

  useEffect(() => {
    console.log("useEffect called to setup listener to receive message");

    refSocket.current.on("chat message", (data) => {
      console.log("chat from server: " + data);
      setChats((chats) => [
        ...chats,
        { sentMessage: false, messageText: data },
      ]);
    });
  }, []);

  function newChatMessage(e) {
    e.preventDefault();

    if (currentMessage.length > 0) {
      console.log("New Chat Message: " + currentMessage);

      refSocket.current.emit("chat message", currentMessage, (inRoom) => {
        if (inRoom === true) {
          // only display message if in a room
          setChats((chats) => [
            ...chats,
            { sentMessage: true, messageText: currentMessage },
          ]);
        }
      });
      setCurrentMessage("");
    }
  }

  function joinRoom(e) {
    e.preventDefault();

    if (roomNameText.length > 0) {
      console.log("Join Room: " + roomNameText);
      refSocket.current.emit("join", roomNameText);
      setCurrentRoom(roomNameText);
      setRoomNameText("");
    }
  }

  function onChangeCurrentMessage(e) {
    setCurrentMessage(e.target.value);
  }

  function onChangeRoomNameText(e) {
    setRoomNameText(e.target.value);
  }

  function chatList() {
    return chats.map(function (currentChat, i) {
      const { sentMessage, messageText } = currentChat;
      return (
        <div
          key={i}
          className={sentMessage ? "SentMessage" : "ReceivedMessage"}
        >
          {messageText}
        </div>
      );
    }, this);
  }

  return (
    <div className="App">
      <ScrollToBottom className="ChatMessagesWrapper">
        <div className="ChatMessages">
          {chatList()}
          <br />
        </div>
      </ScrollToBottom>
      <div className="form">
        <input
          type="text"
          className="currentMessage"
          value={currentMessage}
          onChange={onChangeCurrentMessage}
          onKeyPress={(e) => (e.key === "Enter" ? newChatMessage(e) : null)}
          autoComplete="off"
        />
        <button onClick={(e) => newChatMessage(e)}>Send</button>
      </div>
      <div className="JoinRoomWrapper">
        <div className="CurrentRoom"><b>Current room:</b> {currentRoom}</div>
        <input
          type="text"
          className="roomName"
          value={roomNameText}
          onChange={onChangeRoomNameText}
          onKeyPress={(e) => (e.key === "Enter" ? joinRoom(e) : null)}
        />
        <button onClick={(e) => joinRoom(e)}>Join Room</button>
      </div>
    </div>
  );
}

export default App;
