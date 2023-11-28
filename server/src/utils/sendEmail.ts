import sgMail from "@sendgrid/mail"

export default async function sendEmail(to: string, subject: string, text: string, html?: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

  const msg = {
    to, // recipient
    from: "your-gmail-email@gmail.com", // your Gmail address registered with SendGrid
    subject,
    text,
    html,
  }

  try {
    await sgMail.send(msg)
    console.log("Email sent successfully")
  } catch (error) {
    console.error("Error sending email:", error)
    if (error) {
      console.error(error)
    }
  }
}