import nodemailer from "nodemailer"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const user = process.env.GMAIL_SMTP_USER
  const password = process.env.GMAIL_SMTP_APP_PASSWORD
  const from = process.env.EMAIL_FROM || user

  if (!user || !password || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", { to, subject, text })
      return
    }

    throw new Error("Email delivery is not configured")
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass: password,
    },
  })

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })
}
