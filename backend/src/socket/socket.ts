// src/socket/socket.ts
import * as http from "node:http";
import express from "express";
import {Server} from "socket.io";
import {socketAuthMiddleware} from "./socketAuthMiddleware";

// console.log("socket.ts module loaded");


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

// apply authentication middleware to all socket connections
console.log("Socket.IO server initialized");

// apply authentication middleware to all socket connections
io.use((socket, next) => {
    console.log("Socket middleware reached");
    socketAuthMiddleware(socket, next).then(r => console.log("Middleware Activated"));
});

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId : any) {
    return userSocketMap[userId];
}

const userSocketMap : Record<string, string> = {}; // {userId:socketId}

io.on("connection", (socket : any) => {
    // console.log("Socket : ", socket)
    console.log("A user connected", socket.user.fullName);

    const userId = socket.userId;
    userSocketMap[userId] = socket.id;

    // io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // with socket.on we listen for events from clients
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };