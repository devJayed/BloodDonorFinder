import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getAuthSession } from "@/lib/server-permissions"
import User from "@/models/User"

// PATCH /api/profile - Update the current user's own profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email } = await request.json()
    const normalizedName = typeof name === "string" ? name.trim() : ""
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : ""

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      )
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: session.user.id },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 409 }
      )
    }

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    user.name = normalizedName
    user.email = normalizedEmail
    await user.save()

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
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
