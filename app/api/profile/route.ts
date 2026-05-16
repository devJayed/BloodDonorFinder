import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { isEmail, isMobile, normalizeEmail, normalizeMobile } from "@/lib/auth-identifiers"
import { getAuthSession } from "@/lib/server-permissions"
import User from "@/models/User"

// PATCH /api/profile - Update the current user's own profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, mobile } = await request.json()
    const normalizedName = typeof name === "string" ? name.trim() : ""
    const normalizedEmail =
      typeof email === "string" && email.trim() ? normalizeEmail(email) : ""
    const normalizedMobile =
      typeof mobile === "string" && mobile.trim() ? normalizeMobile(mobile) : ""

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      )
    }

    if (!normalizedEmail && !normalizedMobile) {
      return NextResponse.json(
        { error: "Email or mobile number is required" },
        { status: 400 }
      )
    }

    if (normalizedEmail && !isEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    if (normalizedMobile && !isMobile(normalizedMobile)) {
      return NextResponse.json(
        { error: "Please enter a valid mobile number" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const existingUser = await User.findOne({
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedMobile ? [{ mobile: normalizedMobile }] : []),
      ],
      _id: { $ne: session.user.id },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or mobile is already in use" },
        { status: 409 }
      )
    }

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.name = normalizedName
    if (normalizedEmail) {
      user.email = normalizedEmail
    } else {
      user.email = undefined
    }
    if (normalizedMobile) {
      user.mobile = normalizedMobile
    } else {
      user.mobile = undefined
    }
    await user.save()

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
