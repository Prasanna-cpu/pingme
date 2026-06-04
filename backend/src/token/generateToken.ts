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

    res.cookie("jwt", token, {
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        sameSite : "strict",
        secure : process.env.NODE_ENV !== "development"
    })

    return token
}