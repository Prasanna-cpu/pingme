import {createClient} from "redis";

export const redisClient = createClient({
    url : process.env.REDIS_URL
})

redisClient.on("error", (error)=> {
    console.error("Error Occurred : ", error)
})

redisClient.on("connect", () => {
    console.info("Redis Client Connected")
})

redisClient.on("ready", () => {
    console.info("Redis Client Ready")
})

export const connectRedis = async () => {
    if(!redisClient.isOpen){
        await redisClient.connect()
    }
}


export const disconnectRedis = async () => {
    if (redisClient.isOpen) {
        await redisClient.quit()
    }
}