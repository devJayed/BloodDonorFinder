import crypto from "crypto"
import { normalizeEmail } from "@/lib/auth-identifiers"
import { connectToDatabase } from "@/lib/mongodb"
import PasswordResetToken, { hashResetSecret } from "@/models/PasswordResetToken"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const resetRequest = await PasswordResetToken.findOne({
      email: normalizeEmail(email),
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    if (resetRequest.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many OTP attempts. Request a new code." },
        { status: 429 }
      )
    }

    if (resetRequest.otpHash !== hashResetSecret(otp.trim())) {
      resetRequest.attempts += 1
      await resetRequest.save()

      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString("hex")

    resetRequest.verifiedAt = new Date()
    resetRequest.resetTokenHash = hashResetSecret(resetToken)
    resetRequest.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await resetRequest.save()

    return NextResponse.json({
      message: "OTP verified",
      resetToken,
    })
  } catch (error) {
    console.error("Password reset verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
