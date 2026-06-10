import express from "express";
import {check, getAllUsers, updateProfile} from "../controller/user-controller";
import {protectRoute} from "../auth/auth-middleware";
import {asyncHandler} from "../error-handling/asyncHandler";
import {sensitiveActionRateLimiter} from "../rate-limiter/rateLimiter";
import {cacheMiddleware} from "../cache/cacheMiddleware";

const userRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User endpoints
 */

/**
 * @swagger
 * /api/users/update-profile:
 *   put:
 *     summary: Update logged-in user's profile picture
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profilePic
 *             properties:
 *               profilePic:
 *                 type: string
 *                 description: Base64 image or image URL
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *       400:
 *         description: Profile picture required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Profile update failed
 */
userRouter.put(
    "/update-profile",
    sensitiveActionRateLimiter,
    protectRoute,
    asyncHandler(updateProfile)
)

/**
 * @swagger
 * /api/users/check:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User is authenticated
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Check function failed
 */
userRouter.get("/check",
    sensitiveActionRateLimiter,
    protectRoute,
    cacheMiddleware(60, (req) => `auth:check:${(req as any).user._id}`),
    check
)

/**
 * @swagger
 * /api/users/all:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All users retrieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve users
 */
userRouter.get("/all",
    sensitiveActionRateLimiter,
    protectRoute,
    cacheMiddleware(300, () => "users:all"),
    getAllUsers
)


export default userRouter