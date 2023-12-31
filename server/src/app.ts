import express, { NextFunction, Request, Response } from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import apiRoutes from "./routes/api"

dotenv.config()

const app = express()

const port = process.env.PORT || 3000


app.use(cors())
app.use(express.json())
app.use("/api", apiRoutes)

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send("Sorry can't find that!")
})

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(401).send("Unauthenticated!")
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

export default app
