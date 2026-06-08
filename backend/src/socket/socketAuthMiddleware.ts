import jwt from "jsonwebtoken"
import User from "../entity/User";
import {NextFunction} from "express";
import user from "../entity/User";

export const socketAuthMiddleware = async (socket : any, next : any) => {
    try {
        const token = socket.handshake.headers.cookie
            ?.split("; ")
            .find((row : any) => row.startsWith("jwt="))
            ?.split("=")[1];

        if (!token) {
            console.log("Socket connection rejected: No token provided");
            return next(new Error("Unauthorized - No Token Provided"));
        }

        const decodedUser = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

        if(!decodedUser){
            console.error("User not found, Connection rejected")
        }

        socket.user = decodedUser
        socket.userId = decodedUser.userId

        console.info(`Socket authenticated for user with the id ${decodedUser.userId}`)

        next();

    }
    catch (e) {
        console.error("Socket authentication error: ", e)
        next(new Error("Unauthorized - Invalid Token"))
    }
}