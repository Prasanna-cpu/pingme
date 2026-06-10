import express from "express";
import {check, getAllUsers, updateProfile} from "../controller/user-controller";
import {protectRoute} from "../auth/auth-middleware";
import {asyncHandler} from "../error-handling/asyncHandler";
import {sensitiveActionRateLimiter} from "../rate-limiter/rateLimiter";
import {cacheMiddleware} from "../cache/cacheMiddleware";

const userRouter = express.Router()

userRouter.put(
    "/update-profile",
    sensitiveActionRateLimiter,
    protectRoute,
    asyncHandler(updateProfile)
)

userRouter.get("/check",
    sensitiveActionRateLimiter,
    protectRoute,
    cacheMiddleware(60, (req) => `auth:check:${(req as any).user._id}`),
    check
)

userRouter.get("/all",
    sensitiveActionRateLimiter,
    protectRoute,
    cacheMiddleware(300, () => "users:all"),
    getAllUsers
)


export default userRouter