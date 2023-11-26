import { Router, Request, Response } from "express"
import multer from "multer"
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node"

const router = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.get("/health", (req, res) => {
  res.send("Success")
})

// TODO: add auth
router.post("/upload", upload.array("files"), async (req, res) => {
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

router.get("/protected", ClerkExpressRequireAuth({}), (req, res) => {
  res.send("Auth'd")
})

export default router
