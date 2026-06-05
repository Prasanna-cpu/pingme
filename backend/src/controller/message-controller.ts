import {Response} from "express";
import {AuthenticatedRequest} from "../auth/auth-middleware";
import User from "../entity/User";
import Message from "../entity/Message";
import {messageSchema} from "../validation/message-validation";
import cloudinary from "../cloudinary/cloudinary";

export async function getAllContacts(req : AuthenticatedRequest, res : Response){
    try{
        const loggedInUserId = req.user?._id;

        const filteredUsers = await User.find({
            _id : {$ne : loggedInUserId}
        }).select("-password")

        return res.status(200).json({
            status : res.statusCode,
            message : "All contacts retrieved",
            data : {
                users : filteredUsers
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

        const chatPartners = await User.find({
            _id : {$in : chatPartnerIds}
        }).select("-password")

        return res.status(200).json({
            status : res.statusCode,
            message : "Chat Partners",
            data : {
                users : chatPartners
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

        const {text, image} = req.body

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

        const conversationMessages = await Message.find({
            $or : [
                {senderId : myId, receiverId : userToChatId},
                {senderId : userToChatId, receiverId : myId}
            ]
        })

        return res.status(200).json({
            status : res.statusCode,
            message : "Messages retrieved successfully",
            data : {
                messages : conversationMessages
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