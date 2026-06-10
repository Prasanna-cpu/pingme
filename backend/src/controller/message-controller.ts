import {Response} from "express";
import {AuthenticatedRequest} from "../auth/auth-middleware";
import User from "../entity/User";
import Message from "../entity/Message";
import {messageSchema} from "../validation/message-validation";
import cloudinary from "../cloudinary/cloudinary";
import {deleteCacheKey} from "../cache/cacheInvalidation";
import {getReceiverSocketId, io} from "../socket/socket";

const getPaginationParams = (req : AuthenticatedRequest) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    return {page, limit, skip};
}

export async function getAllContacts(req : AuthenticatedRequest, res : Response){
    try{
        const loggedInUserId = req.user?._id;
        const {page, limit, skip} = getPaginationParams(req);

        const filter = {
            _id : {
                $ne : loggedInUserId
            }
        }

        const [filteredUsers, totalUsers] = await Promise.all([
            User.find(filter)
                .select("-password")
                .sort({_id : 1})
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
        ])

        const totalPages = Math.ceil(totalUsers / limit)

        return res.status(200).json({
            status : res.statusCode,
            message : "All contacts retrieved",
            data : {
                users : filteredUsers,
                pagination: {
                    page,
                    limit,
                    totalItems: totalUsers,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            }
        })

    }
    catch (e) {
        return res.status(500).json({
            status : res.statusCode,
            message : "Failed to get contacts"
        })
    }
}

export async function getChatPartners(req : AuthenticatedRequest, res : Response){
    try {
        const loggedInUserId = req.user?._id
        const {page, limit, skip} = getPaginationParams(req)

        const messages = await Message.find({
            $or :[{senderId : loggedInUserId}, {receiverId : loggedInUserId}]
        })

        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        // const chatPartners = await User.find({
        //     _id : {$in : chatPartnerIds}
        // }).select("-password")

        const totalPartners = chatPartnerIds.length

        const paginatedChatPartnerIds = chatPartnerIds.slice(skip, skip + limit);

        const chatPartners = await User.find({
            _id : {
                $in : paginatedChatPartnerIds
            }
        })
            .sort({_id : 1})
            .select("-password");

        const totalPages = Math.ceil(totalPartners / limit);

        return res.status(200).json({
            status : res.statusCode,
            message : "Chat Partners",
            data : {
                users : chatPartners,
                pagination: {
                    page,
                    limit,
                    totalItems: totalPartners,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            }
        })
    }
    catch(e){
        return res.status(500).json({
            status : res.statusCode,
            message : "Failed to get chat partners"
        })
    }
}

export async function sendMessage(req : AuthenticatedRequest, res : Response){
    try{
        const {id : receiverId} = req.params
        const senderId = req.user?._id
        const {error, value} = messageSchema.validate(req.body)

        if(error){
            return res.status(400).json({
                status : res.statusCode,
                message : error.details[0].message
            })
        }

        const {text, image} = value

        if(senderId.equals(receiverId)){
            return res.status(400).json({
                status : res.statusCode,
                message : "Cannot send messages to yourself"
            })
        }

        const receiverExists = await User.exists({_id : receiverId})

        if(!receiverExists){
            return res.status(404).json({
                status : res.statusCode,
                message : "Receiver Not Found"
            })
        }

        let imageUrl;

        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        await newMessage.save()


        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log(`Receiver Socket ID for receiver ${receiverId}: ${receiverSocketId}`);
        if (receiverSocketId) {
            console.log(`Emitting newMessage to socket ${receiverSocketId} for receiver ${receiverId}`);
            io?.to(receiverSocketId).emit("newMessage", newMessage);
        }

        const senderIdString = senderId.toString();

        const conversationKey = [senderIdString, receiverId].sort().join(":");

        await Promise.all([
            deleteCacheKey(`messages:conversation:${conversationKey}`),
            deleteCacheKey(`messages:chat-partners:${senderIdString}`),
            deleteCacheKey(`messages:chat-partners:${receiverId}`)
        ]);

        return res.status(201).json({
            status : res.statusCode,
            data : {
                message : newMessage
            }
        })

    }
    catch (e) {
        return res.status(500).json({
            status : res.statusCode,
            message : "Failed to send message"
        })
    }
}

export async function getMessagesByUserId(req : AuthenticatedRequest, res : Response) {
    try {
        const {id : userToChatId} = req.params
        const myId = req.user?._id
        const {page, limit, skip} = getPaginationParams(req)

        const filter = {
            $or : [
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        }

        const [conversationMessages, totalMessages] = await Promise.all([
            Message.find(filter)
                .sort({createdAt : -1})
                .skip(skip)
                .limit(limit),
            Message.countDocuments(filter)
        ])

        const totalPages = Math.ceil(totalMessages / limit)

        return res.status(200).json({
            status : res.statusCode,
            message : "Messages retrieved successfully",
            data : {
                messages : conversationMessages,
                pagination: {
                    page,
                    limit,
                    totalItems: totalMessages,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            }
        })

    }
    catch (e) {
        return res.status(500).json({
            status : res.statusCode,
            message : "Failed to get messages"
        })
    }
}