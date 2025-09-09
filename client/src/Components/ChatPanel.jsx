import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import CryptoJS from "crypto-js";

const socket = io("http://localhost:3000");
const SECRET_KEY = "dfdf6z86cx8c68x6c8x686z8c"; // use same key in backend

const ChatPanel = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const decrypt = (encryptedText) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return "[Encrypted]";
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    axios
      .get(
        `http://localhost:3000/messages/${currentUser.userId}/${selectedUser.userId}`
      )
      .then((res) => setMessages(res.data));

    socket.emit("join", currentUser.userId);

    socket.on("receive_message", (message) => {
      if (message.senderId === selectedUser.userId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedUser]);

  const sendMessage = () => {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();

    const msg = {
      senderId: currentUser.userId,
      receiverId: selectedUser.userId,
      content: encrypted,
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto bg-white rounded p-4 shadow-inner">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUser.userId;
          const decrypted = decrypt(msg.content);
          return (
            <div
              key={i}
              className={`mb-2 max-w-xs p-2 rounded-lg ${
                isMine ? "ml-auto bg-blue-500 text-white" : "bg-gray-300 text-gray-900"
              }`}
            >
              {decrypted}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2 items-center">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
