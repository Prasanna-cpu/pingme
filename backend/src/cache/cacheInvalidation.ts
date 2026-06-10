import {redisClient} from "./redisClient";

export const deleteCacheKey = async (key : string) => {
    if(!redisClient.isReady){
        return;
    }
    await redisClient.del(key)
}

export const deleteCacheByPattern = async (pattern : string) => {
    if (!redisClient.isReady) {
        return;
    }

    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
        await redisClient.del(keys);
    }
}