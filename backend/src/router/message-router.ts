import express from "express";
import {protectRoute} from "../auth/auth-middleware";
import {getAllContacts, getChatPartners, getMessagesByUserId, sendMessage} from "../controller/message-controller";

const messageRouter = express.Router()

messageRouter.get("/get-message/:id", protectRoute, getMessagesByUserId)
messageRouter.get("/contacts", protectRoute, getAllContacts)
messageRouter.get("/chat-partners", protectRoute, getChatPartners)
messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter