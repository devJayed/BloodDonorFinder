import { normalizeEmail } from "@/lib/auth-identifiers"
import { connectToDatabase } from "@/lib/mongodb"
import PasswordResetToken, { hashResetSecret } from "@/models/PasswordResetToken"
import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, password } = await request.json()

    if (
      typeof email !== "string" ||
      typeof resetToken !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !resetToken.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Email, reset token, and new password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const normalizedEmail = normalizeEmail(email)
    const resetRequest = await PasswordResetToken.findOne({
      email: normalizedEmail,
      resetTokenHash: hashResetSecret(resetToken),
      verifiedAt: { $exists: true },
      usedAt: { $exists: false },
      resetTokenExpiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid or expired reset session" },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password")

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset session" },
        { status: 400 }
      )
    }

    user.password = password
    await user.save()

    resetRequest.usedAt = new Date()
    await resetRequest.save()

    return NextResponse.json({
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}
