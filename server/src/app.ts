import express, { NextFunction, Request, Response } from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"
import fs from "fs"
import multer from "multer"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.use(express.json())
app.use(cors())

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(401).send("Unauthenticated!")
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

// app.get("/openai", async (req, res) => {
//   const completion = await openai.chat.completions.create({
//     messages: [{ role: "user", content: "give me a 5 word poem" }],
//     model: "gpt-3.5-turbo",
//   })
//   res.send(completion)
// })

// TODO: add auth
app.post("/api/upload", upload.array("files"), async (req, res) => {
  let responses = []
  try {
    const files = req.files
    if (!Array.isArray(files)) throw new Error("files not listed properly")
    for (const file of files) {
      responses.push(file.originalname)
      //   const aiResp = await openai.files.create({
      //     file: fs.createReadStream(file.buffer),
      //     purpose: "assistants",
      //   })
      //   responses.push(aiResp)
      console.log(file.originalname)
    }
    res.send({ message: "Files uploaded successfully", openaiResps: responses })
  } catch (error) {
    res.status(500).send({ message: "Error uploading files", error: error })
  }
})

app.get("/api/protected", ClerkExpressRequireAuth({}), (req, res) => {
  res.send("Auth'd")
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

export default app