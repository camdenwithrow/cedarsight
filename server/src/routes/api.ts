import { Router, Request, Response } from "express"
import multer from "multer"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"
import * as dotenv from "dotenv"
import { Client as upClient } from "@upstash/qstash"
import { verifyRequestMiddleware } from "../middleware/middleware"

dotenv.config()
const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const upstash = new upClient({ token: process.env.QSTASH_API_TOKEN! })

router.get("/health", (req, res) => {
  res.send("Success")
})

// TODO: add auth
router.post("/upload", ClerkExpressRequireAuth, upload.array("files"), async (req: Request, res: Response) => {
  let responses = []
  try {
    const files = req.files
    if (!Array.isArray(files)) throw new Error("files not listed properly")
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const blob = new Blob([file.buffer], { type: file.mimetype })
      const uploadable = new File([blob], file.originalname, {
        type: file.mimetype,
        lastModified: new Date().getTime(),
      })
      const aiResp = await openai.files.create({
        file: uploadable,
        purpose: "assistants",
      })
      const upResp = await upstash.publishJSON({
        url: `${process.env.THIS_API_URL}/summarize`,
        delay: i,
        body: { fileId: aiResp.id },
      })
      responses.push({ openAi: aiResp, upstash: upResp })
    }
    res.send({ message: "Files uploaded successfully", openaiResps: responses })
  } catch (error) {
    res.status(500).send({ message: "Error uploading files", error: error })
  }
})

router.post("summarize", verifyRequestMiddleware, async (req: Request, res: Response) => {
  try {
    const fileId: string = req.body.fileId
    const msgContent = req.body.prompt ?? `
      Please summarize this earnings report in around 750 words, include all important financial data points such as:
      Revenue: growth, absolute and growth and absolute by segment
      Gross Profits: growth, absolute
      Gross Margin: growth, absolute
      OpEx: growth, absolute, R&D: growth, absolute, SG&A: growth, absolute
      Other Expenses,
      Inventories: growth, absolute,
      EBIT: growth, absolute, and growth, absolute by segment
      EBT: growth, absolute, and growth, absolute by segment
      Net: growth, absolute
      EPS: growth, absolute
      FCF: growth, absolute,
      Next quarter guidence including by segment
      Any other import financial data point you feel is necessary to include
    `
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: msgContent,
          file_ids: [fileId],
        },
      ],
    })
    const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: process.env.ASSISSTANT_ID! })
  } catch (error) {
    res.status(500).send({ message: "Error runing assisstant thread:", error: error })
  }
})

router.get("/protected", ClerkExpressRequireAuth, (req: Request, res: Response) => {
  res.send("Auth'd")
})

export default router
