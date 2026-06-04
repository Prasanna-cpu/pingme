import {Request, Response} from "express";
import AppError from "../error-handling/AppError";
import {loginSchema, registerSchema} from "../validation/auth-validation";
import User from "../entity/User";
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import {generateToken} from "../token/generateToken";
import {sendWelcomeEmail} from "../emails/emailHandlers";


export async function register(req : Request, res : Response) {
    try{
        const {error, value} = registerSchema.validate(req.body)

        if(error){
            return res.status(400).json({
                status : res.statusCode,
                message : error.details[0].message
            })
        }

        const {fullName , email, password, confirmPassword, profilePic} = req.body

        if(password !== confirmPassword){
            return res.status(400).json({
                status : res.statusCode,
                message : "Password and Confirm Password must match"
            })
        }

        const checkUser = await User.exists({
            email : email
        })

        if(checkUser){
            return res.status(409).json({
                status : res.statusCode,
                message : "The Above Email is Taken"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password : hashedPassword,
            profilePic
        })

        if(newUser){
            const savedUser = await newUser.save()
            generateToken(newUser._id, res)
            try {
                await sendWelcomeEmail(savedUser.fullName, savedUser.email, process.env.CLIENT_URL ?? '');
            }
            catch (err) {
                console.error("Failed to send welcome email:", err);
            }
            return res.status(201).json({
                status : res.statusCode,
                message : "User registered successfully",
                data : {
                    user : {
                        id : newUser._id,
                        fullName : newUser.fullName,
                        email : newUser.email,
                        profilePic : newUser.profilePic
                    }
                }
            })

        }
        else {
            return res.status(400).json({
                status : res.statusCode,
                message : "Invalid User Data"
            })
        }

    }
    catch(e){
        return res.status(500).json({
            status : res.statusCode,
            message: "Register failed"
        })
    }

}

export async function login(req : Request, res : Response) {
    try{
        const {error, value} = loginSchema.validate(req.body)

        if(error){
            return res.status(400).json({
                status : res.statusCode,
                message : error.details[0].message
            })
        }

        const {email, password} = req.body

        const checkUser = await User.exists({
            email : email
        })

        if(!checkUser){
            return res.status(404).json({
                status : res.statusCode,
                message : "User not found"
            })
        }

        const requiredUser = await User.findOne({
            email : email
        })

        const isPasswordCorrect = await bcrypt.compare(password, (requiredUser as mongoose.Document).get("password"))

        if(!isPasswordCorrect){
            return res.status(401).json({
                status : res.statusCode,
                message : "Invalid credentials"
            })
        }

        const targetUserWithoutPassword = await User.findOne({email}).select("-password")

        generateToken((requiredUser as mongoose.Document)._id, res)

        return res.status(200).json({
            status : res.statusCode,
            message : "User logged in successfully",
            data : {
                user : targetUserWithoutPassword
            }
        })

    }
    catch(e){
        return res.status(500).json({
            status : res.statusCode,
            message: "Login failed"
        })
    }
}

export function logout(req : Request, res : Response){
    res.cookie("jwt","",{maxAge: 0})
    return res.status(200).json({
        status : res.statusCode,
        message : "Logged Out Successfully"
    })
}