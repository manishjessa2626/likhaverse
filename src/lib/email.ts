import nodemailer from "nodemailer"

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured. Verification emails will be logged to console.")
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    console.log(`[DEV] Verification code for ${to}: ${code}`)
    return true
  }

  try {
    await transporter.sendMail({
      from: `"LikhaVerse" <${process.env.SMTP_USER}>`,
      to,
      subject: "Verify your LikhaVerse email",
      html: `
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:sans-serif">
          <h1 style="font-size:24px;color:#171717;margin-bottom:16px">LikhaVerse</h1>
          <p style="color:#525252;line-height:1.6">Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f5f5f5;border-radius:12px;margin:16px 0;color:#2563eb">
            ${code}
          </div>
          <p style="color:#737373;font-size:14px">This code expires in 10 minutes.</p>
        </div>
      `,
    })
    return true
  } catch (err) {
    console.error("Failed to send email:", err)
    return false
  }
}
