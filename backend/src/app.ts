import express from "express"
import cors from "cors"
import { defaultMaxListeners } from 'node:events'

const app = express()

app.use(cors())
app.use(express.json())


app.get("/", (req, res)=>{
    return res.status(200).json({
        success: true,
        message: "Drone Fleet Backend Running 🚁",
    })
})

export default app