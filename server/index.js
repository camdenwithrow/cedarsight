const express = require("express")
const cors = require("cors")
const clerk = require("@clerk/clerk-sdk-node")
const multer = require("multer")
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send({message: "Heyyy"})

})

app.get("/protected", clerk.ClerkExpressRequireAuth({
}), (req, res) => {
    res.json(req.auth)
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(401).send('Unauthenticated!')
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });