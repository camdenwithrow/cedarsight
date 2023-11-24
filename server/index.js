const express = require("express")
const cors = require("cors")
const clerk = require("@clerk/clerk-sdk-node")

app.use(express.json())
app.use(cors())
app.use(clerk.ClerkExpressRequireAuth());

app.post('/', (req, res) => {
  const { userId, sessionId, getToken } = req.auth;
  // Your handler...
})