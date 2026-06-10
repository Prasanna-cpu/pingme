import helmet from "helmet";
import express , {Request, Response} from "express"
import dotenv from "dotenv"
import cors from "cors"
import standardRateLimiter, {botUserAgentBlocker, suspiciousRequestBlocker} from "./rate-limiter/rateLimiter";
import {requestTimeout} from "./time-out/timeOut";
import client from "prom-client"
import httpMetricRecorder from "./request-tracker/httpRequestTracker";
import {setServers} from "node:dns/promises";
import {connectDB} from "./database/connectDB";
import {errorHandler} from "./error-handling/errorHandler";
import authRouter from "./router/auth-router";
import userRouter from "./router/user-router";
import cookieParser from "cookie-parser";
import messageRouter from "./router/message-router";
// import {server} from "./socket/socket";
import {connectRedis, disconnectRedis} from "./cache/redisClient";
import * as http from "node:http";
import {app, server, io} from "./socket/socket";

setServers(["1.1.1.1","8.8.8.8"])


dotenv.config()

const port = process.env.PORT as string
const uri = process.env.MONGO_URI as string


client.collectDefaultMetrics()
const register = client.register

if(port === undefined || port === null){
    throw new Error("port is not defined")
}

// const app = express()

// const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin : process.env.CLIENT_URL,
    credentials : true
}))
app.use(botUserAgentBlocker)
app.use(suspiciousRequestBlocker)
app.use(standardRateLimiter)
app.use(requestTimeout(15000))
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "trusted-cdn.com"],
                styleSrc: ["'self'", "fonts.googleapis.com"],
                imgSrc: ["'self'", "data:"],
            },
        },
    })
);
app.use(httpMetricRecorder())
app.use(cookieParser())

app.use("/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/messages", messageRouter)

app.get("/", (req, res) => {
    res.send("Hello")
})

app.get("/metrics", async(req : Request, res : Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
})

app.use(errorHandler)

const startServer = async() => {
    try{
        await connectRedis()
        console.info("Connected to Redis")

        await connectDB(uri)
        console.info("Connected to MongoDB")

        server.listen(port, () => {
            console.info(`Server is running on  http://localhost:${port}`)
        })


    }
    catch(error){
        console.error("Failed to start the server : ", error)
    }
}

process.on("SIGINT", async () => {
    await disconnectRedis()
    process.exit(0)
})

process.on("SIGTERM", async() => {
    await disconnectRedis()
    process.exit(0)
})

startServer().then(r => console.log("Server Started"));