import sgMail from "@sendgrid/mail"

export default async function sendEmail(to: string, subject: string, text: string, html?: string) {
  console.log(process.env.SENDGRID_API_KEY)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  const msg = {
    to, // recipient
    from: "withrowcamden@gmail.com", // your Gmail address registered with SendGrid
    subject,
    text,
    html,
  }

  try {
    const resp = await sgMail.send(msg)
    return { ...resp }
  } catch (error) {
    return { error: error }
  }
}
