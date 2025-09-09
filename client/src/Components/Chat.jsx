import { useUser,UserButton } from "@clerk/clerk-react";
import { useEffect, useState,Us } from "react";
import axios from "axios";
import io from "socket.io-client";
import CryptoJS from "crypto-js";

const socket = io("http://localhost:3000");
const SECRET_KEY = "dfdf6z86cx8c68x6c8x686z8c";

const Navbar = () => {
  const { user } = useUser();

  return (
    <nav className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white shadow-lg">
      <div className="text-xl font-bold tracking-tight">ConnectSphere</div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{user?.emailAddresses[0]?.emailAddress}</span>
        <UserButton />
      </div>
    </nav>
  );
};

const Sidebar = ({ currentUserId, onSelect }) => {
  const [friends, setFriends] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");

  const fetchFriends = () => {
    axios
      .get(`http://localhost:3000/friends/${currentUserId}`)
      .then((res) => setFriends(res.data));
  };

  useEffect(() => {
    if (currentUserId) fetchFriends();
  }, [currentUserId]);

  const handleAddFriend = () => {
    setError("");
    axios
      .post("http://localhost:3000/add-friend", {
        userId: currentUserId,
        friendEmail: emailInput,
      })
      .then(() => {
        setEmailInput("");
        fetchFriends();
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error adding friend");
      });
  };

  return (
    <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 flex flex-col gap-4 h-screen">
      <h2 className="text-2xl font-semibold text-gray-800">Friends</h2>
      <div className="flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Add friend by email"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button
          onClick={handleAddFriend}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex-1 overflow-y-auto space-y-2">
        {friends.map((friend) => (
          <div
            key={friend.userId}
            onClick={() => onSelect(friend)}
            className="p-3 rounded-lg hover:bg-indigo-100 cursor-pointer text-sm text-gray-700 font-medium transition"
          >
            {friend.email}
          </div>
        ))}
      </div>
    </div>
  );
};

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
    <div className="flex-1 flex flex-col bg-white p-6">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUser.userId;
          const decrypted = decrypt(msg.content);
          return (
            <div
              key={i}
              className={`max-w-md p-3 rounded-lg ${
                isMine
                  ? "ml-auto bg-gray-600 text-white"
                  : "bg-gray-200 text-gray-800"
              } shadow-sm`}
            >
              {decrypted}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const Chat = () => {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user) {
      const userId = user.id;
      const email = user.primaryEmailAddress.emailAddress;

      axios
        .post("http://localhost:3000/add-user", { userId, email })
        .then((res) => setCurrentUser(res.data));
    }
  }, [user]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentUserId={currentUser?.userId} onSelect={setSelectedUser} />
        {selectedUser ? (
          <ChatPanel currentUser={currentUser} selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex justify-center items-center text-gray-500 font-medium">
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;