import * as jose from "jose"
import crypto from "crypto-js"
import * as dotenv from "dotenv"
import { NextFunction, Request, Response } from "express"

dotenv.config()

type VerifyRequest = {
  signature: string // The signature from the `upstash-signature` header.
  body: string
  url?: string // URL of the endpoint where the request was sent to.

  /**
   * Number of seconds to tolerate when checking `nbf` and `exp` claims, to deal with small clock differences among different servers
   * @default 0
   */
  clockTolerance?: number
}

class SignatureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SignatureError"
  }
}

async function verifyWithKey(key: string, req: VerifyRequest): Promise<boolean> {
  const jwt = await jose
    .jwtVerify(req.signature, new TextEncoder().encode(key), {
      issuer: "Upstash",
      clockTolerance: req.clockTolerance,
    })
    .catch((e) => {
      throw new SignatureError((e as Error).message)
    })
  const p = jwt.payload as {
    iss: string
    sub: string
    exp: number
    nbf: number
    iat: number
    jti: string
    body: string
  }
  if (typeof req.url !== "undefined" && p.sub !== req.url) {
    throw new SignatureError(`invalid subject: ${p.sub}, want: ${req.url}`)
  }
  const bodyHash = crypto.SHA256(req.body as string).toString(crypto.enc.Base64url)
  const padding = new RegExp(/=+$/)
  if (p.body.replace(padding, "") !== bodyHash.replace(padding, "")) {
    throw new SignatureError(`body hash does not match, want: ${p.body}, got: ${bodyHash}`)
  }

  return true
}

export async function verify(req: VerifyRequest): Promise<boolean> {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY

  if (!currentSigningKey || !nextSigningKey) throw new Error("No signing key")

  const isValid = await verifyWithKey(currentSigningKey, req)
  if (isValid) {
    return true
  }
  return verifyWithKey(nextSigningKey, req)
}

export const verifyRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the signature from the headers
    const signature = req.headers["upstash-signature"] as string

    // If there's no signature or raw body, throw an error
    if (!signature || !req.body) {
      throw new SignatureError("Missing signature or body")
    }

    // Prepare the object for verification
    const verifyReq: VerifyRequest = {
      signature,
      body: req.body,
      url: req.originalUrl,
    }

    // Perform verification
    const isValid = await verify(verifyReq)

    if (isValid) {
      next() // Verification successful, proceed to the next middleware/route handler
    } else {
      res.status(401).send("Invalid signature")
    }
  } catch (error) {
    if (error instanceof SignatureError) {
      res.status(401).send(error.message)
    } else {
      res.status(500).send("Internal server error")
    }
  }
}
