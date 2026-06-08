import {Request, Response, NextFunction} from "express";
import jwt, {JwtPayload} from "jsonwebtoken"
import User from "../entity/User";

interface DecodedToken extends JwtPayload{
    userId? : string | any
}

export interface AuthenticatedRequest extends Request{
    user? : any
}

export const protectRoute = async (
    req : AuthenticatedRequest,
    res : Response,
    next : NextFunction
)=> {
    try{
        const token = req.cookies?.jwt

        if(!token){
            return res.status(401).json({
                status : res.statusCode,
                message : "Unauthorized , no token"
            })
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("Secret not defined")
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken

        // console.log("Decoded : ",decoded)

        // if(!decoded){
        //     return res.status(401).json({
        //         status : res.statusCode,
        //         message : "Unauthorized, invalid token"
        //     })
        // }

        const user = await User.findById(decoded.userId).select("-password")

        // console.log("User : ", user)

        if(!user){
            return res.status(404).json({
                status : res.statusCode,
                message : "User not found"
            })
        }

        req.user = user;
        next()
    }
    catch (e) {
        console.log("Error in Middleware : ", e)

        // If token verification failed (invalid/expired token) return 401 instead of 500
        const errName = (e as any)?.name
        if (errName === 'JsonWebTokenError' || errName === 'TokenExpiredError') {
            return res.status(401).json({
                status: res.statusCode,
                message: "Unauthorized, invalid or expired token"
            })
        }

        return res.status(500).json({
            status : res.statusCode,
            message : "Internal Server Error"
        })
    }
}