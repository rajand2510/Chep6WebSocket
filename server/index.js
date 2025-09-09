const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect('mongodb+srv://roomcraft:7FaU2sQurB3Sevdh@roomcraft.gps0ygv.mongodb.net/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ==== Schemas ====

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  email: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  content: String, // encrypted content
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);

// ==== Optional: Decryption Function (for admin tools or logging) ====

const SECRET_KEY = "dfdf6z86cx8c68x6c8x686z8c";

function decryptMessage(encryptedText) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return "[Invalid encryption]";
  }
}

// ==== REST API Routes ====

app.post("/add-user", async (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email) return res.status(400).json({ message: "Missing fields" });

  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId, email });
    await user.save();
  }

  res.status(200).json(user);
});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

app.get("/friends/:userId", async (req, res) => {
  const user = await User.findOne({ userId: req.params.userId }).populate("friends");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user.friends);
});

app.post("/add-friend", async (req, res) => {
  const { userId, friendEmail } = req.body;

  const currentUser = await User.findOne({ userId });
  const friendUser = await User.findOne({ email: friendEmail });

  if (!friendUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (currentUser.userId === friendUser.userId) {
    return res.status(400).json({ message: "You can't add yourself" });
  }

  const alreadyFriends = currentUser.friends.includes(friendUser._id);
  if (alreadyFriends) {
    return res.status(400).json({ message: "Already added as friend" });
  }

  currentUser.friends.push(friendUser._id);
  friendUser.friends.push(currentUser._id);

  await currentUser.save();
  await friendUser.save();

  res.json({ message: "Friend added successfully", friend: friendUser });
});

app.get("/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;

  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort({ timestamp: 1 });

  // Optional: Decrypt messages before sending (only for admin tools)
  // const decryptedMessages = messages.map(msg => ({
  //   ...msg._doc,
  //   content: decryptMessage(msg.content),
  // }));

  res.json(messages);
});

// ==== Socket.IO Setup ====

const io = new Server(server, {
  cors: {
    origin: "*", // change in production
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;

    if (!senderId || !receiverId || !content) return;

    const message = new Message({ senderId, receiverId, content });
    await message.save();

    io.to(receiverId).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ==== Start Server ====

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
