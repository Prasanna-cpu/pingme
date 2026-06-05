import express from "express";
import {login, logout, register} from "../controller/auth-controller";
import {asyncHandler} from "../error-handling/asyncHandler";
import {authRateLimiter} from "../rate-limiter/rateLimiter";

const authRouter = express.Router()

authRouter.post("/login", authRateLimiter, asyncHandler(login))
authRouter.post("/register", authRateLimiter, asyncHandler(register))
authRouter.post("/logout", logout)


export default authRouter