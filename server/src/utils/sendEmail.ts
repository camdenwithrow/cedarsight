// import sgMail from "@sendgrid/mail"
import nodemailer from "nodemailer"



export default async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const config = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "cedarsight@gmail.com",
      pass: process.env.EMAIL_PASS!,
    },
  }

  const data = {
    from: "cedarsight@gmail.com",
    to: to,
    subject: subject,
    text: text,
  }

  const transporter = nodemailer.createTransport(config)
  const resp = await transporter.sendMail(data)
  return resp.response

  // console.log(process.env.SENDGRID_API_KEY)
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  // const msg = {
  //   to, // recipient
  //   from: "withrowcamden@gmail.com", // your Gmail address registered with SendGrid
  //   subject,
  //   text,
  //   html,
  // }

  // try {
  //   const resp = await sgMail.send(msg)
  //   return { ...resp }
  // } catch (error) {
  //   return { error: error }
  // }
}
