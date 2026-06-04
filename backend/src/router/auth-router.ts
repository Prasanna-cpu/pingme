import express from "express";
import {login, logout, register} from "../controller/auth-controller";
import {asyncHandler} from "../error-handling/asyncHandler";

const authRouter = express.Router()

authRouter.post("/login", asyncHandler(login))
authRouter.post("/register", asyncHandler(register))
authRouter.post("/logout", logout)


export default authRouter