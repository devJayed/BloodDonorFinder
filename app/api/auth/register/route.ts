import { connectToDatabase } from "@/lib/mongodb"
import { isEmail, isMobile, normalizeEmail, normalizeMobile } from "@/lib/auth-identifiers"
import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server"

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, mobile, password } = body
    const normalizedEmail =
      typeof email === "string" && email.trim() ? normalizeEmail(email) : ""
    const normalizedMobile =
      typeof mobile === "string" && mobile.trim() ? normalizeMobile(mobile) : ""

    // Validate input
    if (!name || !password || (!normalizedEmail && !normalizedMobile)) {
      return NextResponse.json(
        { error: "Name, password, and either email or mobile are required" },
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedMobile ? [{ mobile: normalizedMobile }] : []),
      ],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or mobile already exists" },
        { status: 409 }
      )
    }

    // Create new user
    const user = await User.create({
      name,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedMobile ? { mobile: normalizedMobile } : {}),
      password,
      role: "USER",
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
}
