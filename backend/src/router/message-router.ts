import express from "express";
import {protectRoute} from "../auth/auth-middleware";
import {getAllContacts, getChatPartners, getMessagesByUserId, sendMessage} from "../controller/message-controller";
import {cacheMiddleware} from "../cache/cacheMiddleware";

const messageRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message and chat endpoints
 */

/**
 * @swagger
 * /api/messages/get-message/{id}:
 *   get:
 *     summary: Get conversation messages with a user
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to chat with
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get messages
 */
messageRouter.get(
    "/get-message/:id",
    protectRoute,
    cacheMiddleware(30, (req) => {
        const myId = (req as any).user._id.toString();
        const otherUserId = req.params.id;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

        const conversationKey = [myId, otherUserId].sort().join(":");

        return `messages:conversation:${conversationKey}:page:${page}:limit:${limit}`;
    }),
    getMessagesByUserId
)

/**
 * @swagger
 * /api/messages/contacts:
 *   get:
 *     summary: Get all contacts except logged-in user
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Contacts retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get contacts
 */
messageRouter.get(
    "/contacts",
    protectRoute,
    cacheMiddleware(30, (req) => {
        const myId = (req as any).user._id.toString();
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        return `messages:contacts:${myId}:page:${page}:limit:${limit}`;
    }),
    getAllContacts
)

/**
 * @swagger
 * /api/messages/chat-partners:
 *   get:
 *     summary: Get chat partners for logged-in user
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chat partners retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to get chat partners
 */
messageRouter.get(
    "/chat-partners",
    protectRoute,
    cacheMiddleware(60, (req) => {
        const myId = (req as any).user._id.toString();
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        return `messages:chat-partners:${myId}:page:${page}:limit:${limit}`;
    }),
    getChatPartners
)


/**
 * @swagger
 * /api/messages/send/{id}:
 *   post:
 *     summary: Send a message to a user
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Receiver user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Hello!
 *               image:
 *                 type: string
 *                 description: Base64 image or image URL
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error or cannot message yourself
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 *       500:
 *         description: Failed to send message
 */
messageRouter.post("/send/:id", protectRoute, sendMessage)

export default messageRouter