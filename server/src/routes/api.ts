import { Router, Request, Response } from "express"
import multer from "multer"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"
import fs from "fs"
import * as dotenv from "dotenv"

dotenv.config()
const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

router.get("/health", (req, res) => {
  res.send("Success")
})

// TODO: add auth
router.post("/upload", upload.array("files"), async (req: Request, res: Response) => {
  let responses = []
  try {
    const files = req.files
    if (!Array.isArray(files)) throw new Error("files not listed properly")
    for (const file of files) {
      const blob = new Blob([file.buffer], { type: file.mimetype})
      const uploadable = new File([blob], file.originalname, {
        type: file.mimetype,
        lastModified: new Date().getTime()
      })
      //   responses.push(file.originalname)
      const aiResp = await openai.files.create({
        file: uploadable,
        purpose: "assistants",
      })
      responses.push(aiResp)
      // console.log(file.originalname)
      // responses.push(file.originalname)
    }
    res.send({ message: "Files uploaded successfully", openaiResps: responses })
  } catch (error) {
    res.status(500).send({ message: "Error uploading files", error: error })
  }
})

router.get("/protected", ClerkExpressRequireAuth({}), (req: Request, res: Response) => {
  res.send("Auth'd")
})

export default router
