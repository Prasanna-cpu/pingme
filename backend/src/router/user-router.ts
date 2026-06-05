import express from "express";
import {check, updateProfile} from "../controller/user-controller";
import {protectRoute} from "../auth/auth-middleware";
import {asyncHandler} from "../error-handling/asyncHandler";
import {sensitiveActionRateLimiter} from "../rate-limiter/rateLimiter";

const userRouter = express.Router()

userRouter.put("/update-profile", sensitiveActionRateLimiter, protectRoute, asyncHandler(updateProfile))
userRouter.get("/check", protectRoute, check)


export default userRouter