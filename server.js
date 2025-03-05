import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import os from "os";
import mongoose from "mongoose";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcrypt";

const rounds = 10; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let users = {};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Allow all clients to connect (for dev)
});

const PORT = 3500;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://${getLocalIp()}:${PORT}`);
});

app.use(express.static(path.join(__dirname, "public/")));

mongoose.connect("mongodb://127.0.0.1:27017/SocketIO_Chat");

mongoose.connection.once("open", () => console.log("✅ Connected to MongoDB"));
mongoose.connection.on("error", (err) => console.error("MongoDB Error:", err));

io.on("connection", (socket) => {
  socket.on("Send", async (message, name, reciever) => {
    if(reciever == "all"){
      io.emit("Recieve", message, name, "all");
    }
    else{
      io.emit("Recieve", message, name, reciever);
    }

    const newMessage = new Message({
      message: message,
      sender: name,
      reciever: reciever,
    });
    await newMessage.save();
  })

  socket.on("register", async (username, password) => {
    if(!(await doesUserExist(username))){
      const hash = bcrypt.hashSync(password, rounds);
      const newUser = new User({
        username: username,
        password: hash,
      });
      await newUser.save();
      socket.emit("loadChat", username);
      users[socket.id] = username;
      io.emit("sendUsers", users);
      sendMessages(socket);
    }
    else{
      socket.emit("loginMessage", "Username already exists!")
    }
  })

  socket.on("login", (username, password) => {
    User.find().then((lusers) => {
      lusers.forEach((luser) => {
        if(luser.username == username && bcrypt.compareSync(password, luser.password)){
          socket.emit("loginMessage", "");
          socket.emit("loadChat", luser.username);
          users[socket.id] = username;
          io.emit("sendUsers", users);
          sendMessages(socket);
          return;
        }
      })
    })
    socket.emit("loginMessage", "Wrong username or password!");
  })

  socket.on("disconnect", (reason) => {
    delete users[socket.id];
    io.emit("sendUsers", users);
  })
});

function getLocalIp() {
  let ip = "localhost";
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let i of interfaces[iface]) {
      if (i.family === "IPv4" && !i.internal) ip = i.address;
    }
  }
  return ip; 
}

async function doesUserExist(username) {
  const user = await User.findOne({ username });
  return user !== null; 
}
    
async function sendMessages(socket){
  const messages = await Message.find()
  messages.forEach((message) => {
    socket.emit("Recieve", message.message, message.sender, message.reciever);
  })
}