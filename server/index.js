const express = require("express")
const cors = require("cors")
const clerk = require("@clerk/clerk-sdk-node")
const { OpenAIApi, Configuration } = require('openai');
const fs = require("fs")
const multer = require("multer")
require('dotenv').config()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
  
const openaiClient = new OpenAIApi({apiKey: process.env.OPENAI_API_KEY,});

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send({message: "Heyyy"})

})

app.post("/upload", clerk.ClerkExpressRequireAuth({
}), upload.array('files'), async (req, res) => {
    let responses = []
    try {
        const files = req.files
        for (const file of files) {
            const resp = await openaiClient.files.create({
                file: fs.createReadStream(file.buffer),
                purpose: "assistants"
            })
            responses.push(resp)
        }
        res.send({message: 'Files uploaded successfully', openaiResps: responses})
    } catch (error) {
        res.status(500).send({ message: 'Error uploading files', error: error });
    }
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(401).send('Unauthenticated!')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });