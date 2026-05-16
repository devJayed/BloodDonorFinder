import crypto from "crypto"
import { normalizeEmail } from "@/lib/auth-identifiers"
import { sendEmail } from "@/lib/email"
import { connectToDatabase } from "@/lib/mongodb"
import PasswordResetToken, { hashResetSecret } from "@/models/PasswordResetToken"
import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = normalizeEmail(email)

    await connectToDatabase()

    const user = await User.findOne({ email: normalizedEmail })

    if (user) {
      const otp = crypto.randomInt(100000, 999999).toString()

      await PasswordResetToken.deleteMany({
        email: normalizedEmail,
        usedAt: { $exists: false },
      })

      await PasswordResetToken.create({
        email: normalizedEmail,
        otpHash: hashResetSecret(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })

      await sendEmail({
        to: normalizedEmail,
        subject: "Your Blood Bonding password reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
            <h2>Password reset OTP</h2>
            <p>Your password reset OTP is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</p>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
      })
    }

    return NextResponse.json({
      message: "If an account exists for that email, an OTP has been sent.",
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json(
      { error: "Failed to send password reset OTP" },
      { status: 500 }
    )
  }
}
