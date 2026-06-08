import jwt from "jsonwebtoken"
import express from "express";

export const generateToken = (userId : Object , res : express.Response) => {

    if(!process.env.JWT_SECRET){
        throw new Error("Secret not defined")
    }

    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET as string,{
        expiresIn : "7d"
    })

    const isDev = process.env.NODE_ENV === "development"

    // For development allow cross-origin requests from the dev client by using "lax".
    // In production use SameSite=None and secure=true so cross-site cookies work over HTTPS.
    res.cookie("jwt", token, {
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite : isDev ? "lax" : "none",
        secure : !isDev,
        path: '/'
    })

    return token
}