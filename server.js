import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import os from "os";
import mongoose from "mongoose";
import Message from "./models/Message.js";

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

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/SocketIO_Chat", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

