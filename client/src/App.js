import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";

import ScrollToBottom from "react-scroll-to-bottom";

import "./App.css";

const ENDPOINT = "/"; // needs a proxy to node server (this approach avoids CORS issues in browser)

function App() {
  const [chats, setChats] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const refSocket = useRef(null);

  useEffect(() => {
    console.log("useEffect called to setup");
    refSocket.current = socketIOClient(ENDPOINT);

    return () => refSocket.current.disconnect();
  }, []);

  useEffect(() => {
    console.log("useEffect called to receive message");

    refSocket.current.on("chat message", (data) => {
      console.log("chat from server: " + data);
      //console.log(chats);
      setChats((chats) => [
        ...chats,
        { sentMessage: false, messageText: data },
      ]);
    });
  }, []);

  function newChatMessage(e) {
    e.preventDefault();

    console.log(
      "newChatMessage: " + currentMessage + currentMessage.length
    );

    if (currentMessage.length > 0) {
      refSocket.current.emit("chat message", currentMessage);
      setChats((chats) => [
        ...chats,
        { sentMessage: true, messageText: currentMessage },
      ]);
      setCurrentMessage("");
    }
  }

  function onChangeCurrentMessage(e) {
    setCurrentMessage(e.target.value);
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
    </div>
  );
}

export default App;
