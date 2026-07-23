import express from "express"
import cors from "cors"
import { droneRoutes } from "./features/drone"
import { telemetryRoutes } from "./features/telemetry"
import { missionRoutes } from "./features/mission"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (_req, res)=>{
    return res.status(200).json({
        success: true,
        message: "Drone Fleet Backend Running 🚁",
    })
})

app.use("/api/v1/drones", droneRoutes)
app.use("/api/v1/telemetry", telemetryRoutes)
app.use("/api/v1/missions", missionRoutes)

export default app