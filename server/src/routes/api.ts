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
import fs from "fs"
import pdf from "pdf-parse"

dotenv.config()
const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const upstash = new upClient({ token: process.env.QSTASH_API_TOKEN! })

router.get("/health", (req, res) => {
  res.send("Success")
})

router.post("/upload/chat", upload.array("files"), async (req: Request, res: Response) => {
  try {
    const files = req.files
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).send({ message: "No files uploaded or files not listed properly" })
    }
    const resps = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const data = await pdf(files[i].buffer)

      const upResp = await upstash.publishJSON({
        url: `${process.env.THIS_API_URL}/summarize/chat`,
        body: { email: req.body.email, file: { name: file.originalname, text: data.text } },
      })
      resps.push(upResp)
    }
    res.send({ upResp: resps, message: "success" })
  } catch (error) {
    res.status(500).send({ error: error })
  }
})

router.post("/summarize/chat", async (req: Request, res: Response) => {
  try {
    const msgContent = `
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

      Earnings Report:
      ${req.body.file.text}
    `
    const msgResp = await openai.chat.completions.create({
      model: "gpt-4-32k",
      messages: [{ role: "user", content: msgContent }],
    })
    console.log("openaiResp", msgResp)

    const upResp = await upstash.publishJSON({
      url: `${process.env.THIS_API_URL}/email/chat`,
      body: { email: req.body.email, fileName: req.body.file.name , msg: msgResp },
    })
    console.log("upResp", upResp)

    res.send({ msgResp: msgResp, upResp: upResp, message: "success", })
  } catch (error) {
    res.status(500).send({ error: error })
  }
})

router.post("/email/chat", async (req: Request, res: Response) => {
  try {
    const { email, fileName, msgResp } = req.body

      const emailMsg = (msgResp as OpenAI.ChatCompletion).choices.map((choice) => choice.message.content).join("\n")
      const result = await sendEmail(email, `Your Equity Summary for: ${fileName}`, emailMsg)
      res.send(result)

  } catch (error) {
    res.status(500).send({ error: error })
  }
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
      delay: 90,
      retries: 0,
      body: { threadId: thread.id, runId: run.id, email: req.body.email, file: req.body.file },
    })
    console.log("upResp:", upResp)
    res.send({ threadResp: thread, runResp: run, upResp: upResp, try: 0 })
  } catch (error) {
    res.status(500).send({ message: "Error runing assisstant thread:", error: error })
  }
})

router.post("/email", async (req: Request, res: Response) => {
  try {
    const { threadId, runId, file, email } = req.body
    const run = await openai.beta.threads.runs.retrieve(threadId, runId)
    if (run.status !== "completed") {
      if (run.status === "in_progress" || run.status === "queued") {
        const upResp = await upstash.publishJSON({
          url: `${process.env.THIS_API_URL}/email`,
          delay: 60,
          retries: 0,
          body: { threadId: threadId, runId: runId, email: req.body.email, fileName: file.name },
        })
        res.send(upResp)
      } else {
        res.status(500).send({ message: "not completed" })
      }
    } else {
      const threadResp = await openai.beta.threads.messages.list(threadId)
      console.log("threadResp", threadResp)
      const msgObjs = threadResp.data.flatMap((msgObj) => msgObj.content || [])
      let emailMsg = msgObjs.reduce((acc, val) => {
        if (val.type === "text" && val.text) {
          return `${acc}\n${val.text.value}`
        }
        return acc
      }, "")
      console.log(emailMsg)
      const result = await sendEmail(email, `Your Equity Summary for: ${file.name}`, emailMsg)
      res.send(result)
    }
  } catch (error) {
    res.status(500).send({ error: error })
  }
})

export default router
