
import express from "express"
import dotenv from "dotenv"

dotenv.config()

const port = process.env.PORT

const app = express()

app.get("/", (req, res) => {
    res.send("Hello")
})



app.listen(port, () => {
    console.info(`Server is running on  http://localhost:${port}`)
})