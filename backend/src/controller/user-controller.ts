import {Request, Response} from "express";
import {AuthenticatedRequest} from "../auth/auth-middleware";
import cloudinary from "../cloudinary/cloudinary";
import User from "../entity/User";

export async function updateProfile(req : AuthenticatedRequest, res : Response){
    try{
        const {profilePic} = req.body

        if(!profilePic){
            return res.status(400).json({
                status : res.statusCode,
                message : "Profile Pic Required"
            })
        }

        const userId= req?.user?._id

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, {
            profilePic : uploadResponse.secure_url
        }, {
            returnDocument : 'after'
        }).select("-password")

        return res.status(200).json({
            status : res.statusCode,
            message : "Profile Pic Updated Successfully",
            data : {
                user : updatedUser
            }
        })

    }
    catch (e) {
        return res.status(500).json({
            status : res.statusCode,
            message : "Profile Update Failed"
        })
    }
}

export async function check(req : AuthenticatedRequest, res : Response){
    try{
        return res.status(200).json({
            status : res.statusCode,
            message : "User is authenticated",
            data : {
                user : req.user
            }
        })
    }
    catch (e) {
        return res.status(500).json({
            status : res.statusCode,
            message : "Check function failed"
        })
    }
}