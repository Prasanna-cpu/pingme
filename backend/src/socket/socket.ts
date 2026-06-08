import {Server} from "socket.io"
import http from "http"
import express from "express";
import {socketAuthMiddleware} from "./socketAuthMiddleware";


const app = express();
const server = http.createServer();

const socketServerIO = new Server(server, {
    cors : {
        origin : process.env.CLIENT_URL,
        credentials : true
    }
})

socketServerIO.use(socketAuthMiddleware)

const userSockerMap : Record<string, string> = {};

socketServerIO.on("connection", (socket : any) => {
    console.log(`New socket connection: ${socket.user.fullName}`)
    const userId = String(socket.userId);
    if(userId){
        userSockerMap[userId] = socket.id;
    }
    socketServerIO.emit("getOnlineUsers", Object.keys(userSockerMap))

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.user.fullName}`)
        delete userSockerMap[userId]
        socketServerIO.emit("getOnlineUsers", Object.keys(userSockerMap))
    })
})

export {app, server, socketServerIO}