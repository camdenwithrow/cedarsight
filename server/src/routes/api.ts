import { Router, Request, Response } from "express"
import multer from "multer"
import { Blob, File } from "buffer"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"
import OpenAI from "openai"
import * as dotenv from "dotenv"
import { Client as upClient } from "@upstash/qstash"
import { verifyRequestMiddleware } from "../middleware/middleware"
import sendEmail from "../utils/sendEmail"
import nodemailer from "nodemailer"

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
router.post("/upload", upload.array("files"), async (req: Request, res: Response) => {
  try {
    const files = req.files

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).send({ message: "No files uploaded or files not listed properly" })
    }

    const responses = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log("filename", file.originalname)

      const blob = new Blob([file.buffer], { type: file.mimetype })
      console.log("blob", blob)

      const uploadable = new File([blob], file.originalname, {
        type: file.mimetype,
        lastModified: new Date().getTime(),
      })
      console.log("uploadable", uploadable)

      const aiResp = await openai.files.create({
        file: uploadable,
        purpose: "assistants",
      })
      console.log("aiResponse", file.originalname, aiResp)

      const upResp = await upstash.publishJSON({
        url: `${process.env.THIS_API_URL}/summarize`,
        delay: i,
        body: { email: req.body.email, file: { name: file.originalname, id: aiResp.id } },
      })
      console.log("upResponse", file.originalname, upResp)

      responses.push({ openAi: aiResp, upstash: upResp })
    }
    res.send({ message: "Files uploaded successfully", responses: responses })
  } catch (error) {
    res.status(500).send({ message: "Error uploading files", error: error })
  }
})

router.post("/summarize", async (req: Request, res: Response) => {
  console.log(req.body, "SHOUD BE: fileId, email, fileName")
  try {
    let resps = []
    const fileId: string = req.body.file.id
    const msgContent =
      req.body.prompt ??
      `
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
    console.log("threadResp:", thread)
    const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: process.env.ASSISSTANT_ID! })
    console.log("runResp:", run)
    const upResp = await upstash.publishJSON({
      url: `${process.env.THIS_API_URL}/email`,
      delay: 120,
      body: { threadId: thread.id, runId: run.id, email: req.body.email, fileName: req.body.file.name },
    })
    console.log("upResp:", upResp)
    res.send({ threadResp: thread, runResp: run, upResp: upResp })
  } catch (error) {
    res.status(500).send({ message: "Error runing assisstant thread:", error: error })
  }
})

router.post("/email", async (req: Request, res: Response) => {
  const { threadId, runId } = req.body
  const run = await openai.beta.threads.runs.retrieve(threadId, runId)
  if (run.status !== "completed") {
    res.status(500).send({ message: "not completed" })
  } else {
    const messageResp = await openai.beta.threads.messages.list(threadId)
    const message = messageResp.data.join("\n\n")
    const result = await sendEmail(req.body.email, `Your Equity Summary for: ${req.body.fileName}`, message)
    res.send(result)
  }
})

export default router
