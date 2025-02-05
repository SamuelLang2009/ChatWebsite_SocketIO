import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import os from "os";
import mongoose from "mongoose";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let user = {};

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
    socket.emit("Initialize", socket.id);

    Message.find().then((messages) => {
        messages.forEach((message) => {
          if(message.reciever == "all"){
            socket.emit("Recieve", message.message, message.sender, message.reciever);
          }
        })
    })

    user[socket.id] = socket.id;
    io.emit("sendUsers", user);

    socket.on("nameChange", (name) => {
        user[socket.id] = name;
        io.emit("sendUsers", user);
    })

    socket.on("Send", async (message, name, reciever) => {
        if(reciever == "all"){
            io.emit("Recieve", message, name, "ALL");
        }
        else{
            socket.emit("Recieve", message, name, user[reciever]);
            io.to(reciever).emit("Recieve", message, name, user[reciever]);
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
        const newUser = new User({
          username: username,
          password: password,
        });
        await newUser.save();
        socket.emit("loadChat", username);
      }
      else{
        socket.emit("loginMessage", "Username already exists!")
      }
    })

    socket.on("login", (username, password) => {
      User.find().then((users) => {
        users.forEach((user) => {
          if(user.username == username && user.password == password){
            socket.emit("loadChat", user.username);
          }
        })
      })
      socket.emit("loginMessage", "Wrong username or password!");
    })

    socket.on("disconnect", (reason) => {
        delete user[socket.id];
        io.emit("sendUsers", user);
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
    return ip; // Fallback
  }

  async function doesUserExist(username) {
    const user = await User.findOne({ username });
    return user !== null; // Returns true if found, false otherwise
  }
    

