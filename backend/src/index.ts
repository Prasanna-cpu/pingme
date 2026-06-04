import helmet from "helmet";
import express , {Request, Response} from "express"
import dotenv from "dotenv"
import standardRateLimiter from "./rate-limiter/rateLimiter";
import {requestTimeout} from "./time-out/timeOut";
import client from "prom-client"
import httpMetricRecorder from "./request-tracker/httpRequestTracker";
import {setServers} from "node:dns/promises";
import {connectDB} from "./database/connectDB";
import {errorHandler} from "./error-handling/errorHandler";
import authRouter from "./router/auth-router";
setServers(["1.1.1.1","8.8.8.8"])


dotenv.config()

const port = process.env.PORT as string
const uri = process.env.MONGO_URI as string


client.collectDefaultMetrics()
const register = client.register

if(port === undefined || port === null){
    throw new Error("port is not defined")
}

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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

app.use("/auth", authRouter)

app.get("/", (req, res) => {
    res.send("Hello")
})

app.get("/metrics", async(req : Request, res : Response) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
})

app.use(errorHandler)


app.listen(port, () => {
    console.info(`Server is running on  http://localhost:${port}`)
    connectDB(uri).then(() => {
        console.info("Connected to MongoDB")
    }).catch((err) => {
        console.error("Failed to connect to MongoDB", err)
    })
})