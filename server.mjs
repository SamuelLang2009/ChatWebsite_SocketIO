import { Server } from "socket.io";

let user = {};

import fs from "fs";
import https from "https";

const sslOptions = {
  key: fs.readFileSync("C:/Users/samue/server.key"),  // Path to your private key file
  cert: fs.readFileSync("C:/Users/samue/server.crt"), // Path to your SSL certificate file
};

// Create an HTTPS server
const server = https.createServer(sslOptions, (req, res) => {
  res.writeHead(200);
  res.end("HTTPS Server is running!");
});

const io = new Server(server, {
    cors: {
        origin: "*",
    },
    host: '0.0.0.0',
});

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

server.listen(3000, () => {
    console.log("Server is running on https://10.13.241.165:3000");
  });
