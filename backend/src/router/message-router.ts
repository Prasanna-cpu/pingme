import express from "express";
import {protectRoute} from "../auth/auth-middleware";
import {getAllContacts, getChatPartners, getMessagesByUserId, sendMessage} from "../controller/message-controller";
import {cacheMiddleware} from "../cache/cacheMiddleware";

const messageRouter = express.Router()

messageRouter.get(
    "/get-message/:id",
    protectRoute,
    cacheMiddleware(30, (req) => {
        const myId = (req as any).user._id.toString();
        const otherUserId = req.params.id;

        const conversationKey = [myId, otherUserId].sort().join(":");

        return `messages:conversation:${conversationKey}`;
    }),
    getMessagesByUserId
)

messageRouter.get(
    "/contacts",
    protectRoute,
    cacheMiddleware(300, (req) => {
        const myId = (req as any).user._id.toString();

        return `messages:contacts:${myId}`;
    }),
    getAllContacts
)

messageRouter.get(
    "/chat-partners",
    protectRoute,
    cacheMiddleware(60, (req) => {
        const myId = (req as any).user._id.toString();

        return `messages:chat-partners:${myId}`;
    }),
    getChatPartners
)

messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter