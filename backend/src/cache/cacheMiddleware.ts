import {Request, Response, NextFunction} from "express";
import {redisClient} from "./redisClient";

const defaultTTlSeconds = Number(process.env.REDIS_CACHE_TTL_SECONDS)

export const cacheMiddleware = (
    ttlSeconds : number = defaultTTlSeconds,
    keyBuilder : (req : Request) => string
) => {
    return async (req : Request, res : Response, next : NextFunction) => {
        try{
            if(!redisClient.isReady){
                return next()
            }

            const cacheKey = keyBuilder(req)
            const cachedValue = await redisClient.get(cacheKey)

            if(cachedValue){
                res.setHeader("X-Cache", "HIT")
                return res.status(200).json(JSON.parse(cachedValue))
            }

            const originalJson = res.json.bind(res)

            res.json = (body : unknown) => {
                if(res.statusCode >= 200 && res.statusCode < 300){
                    redisClient
                        .setEx(cacheKey, ttlSeconds, JSON.stringify(body))
                        .catch((error) => {
                            console.error("Failed to set Redis cache:", error);
                        });
                }
                res.setHeader("X-Cache", "MISS")
                return originalJson(body)
            }

            return next();

        }
        catch (e) {
            console.error(" Redis Cache Middleware Error : " , e)
            return next()
        }
    }
}