import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import os from "os";

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

io.on("connection", (socket) => {
    socket.emit("Initialize", socket.id);

    user[socket.id] = socket.id;
    io.emit("sendUsers", user);

    socket.on("nameChange", (name) => {
        user[socket.id] = name;
        io.emit("sendUsers", user);
    })

    socket.on("Send", (message, name, reciever) => {
        if(reciever == "all"){
            io.emit("Recieve", message, name, "ALL");
        }
        else{
            socket.emit("Recieve", message, name, user[reciever]);
            io.to(reciever).emit("Recieve", message, name, user[reciever]);
        }
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

