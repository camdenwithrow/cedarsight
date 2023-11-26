import express, { NextFunction, Request, Response } from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"
import fs from "fs"
import multer from "multer"
import apiRoutes from "./routes/api"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.use(express.json())
app.use(cors())
app.use("/api", apiRoutes)

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(401).send("Unauthenticated!")
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

export default app
