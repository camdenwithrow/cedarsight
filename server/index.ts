import express, { NextFunction, Request, Response } from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.use(express.json())
app.use(cors())

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(401).send("Unauthenticated!")
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/openai", async (req, res) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "give me a 5 word poem" }],
    model: "gpt-3.5-turbo",
  })
  res.send(completion)
})

app.get("/protected", ClerkExpressRequireAuth({}), (req, res) => {
  res.send("Auth'd")
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
