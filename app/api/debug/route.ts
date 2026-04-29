import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    console.log("[v0] Debug: Attempting MongoDB connection...")
    await dbConnect()
    console.log("[v0] Debug: MongoDB connected successfully")

    // Check if users exist
    const users = await User.find({}).select("email name role").lean()
    console.log("[v0] Debug: Found users:", users.length)

    return NextResponse.json({
      status: "connected",
      message: "MongoDB connection successful",
      usersCount: users.length,
      users: users.map((u) => ({
        email: u.email,
        name: u.name,
        role: u.role,
      })),
      env: {
        mongodbUri: process.env.MONGODB_URI ? "Set (hidden)" : "NOT SET",
        nextauthSecret: process.env.NEXTAUTH_SECRET ? "Set (hidden)" : "NOT SET",
        nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
      },
    })
  } catch (error) {
    console.error("[v0] Debug: MongoDB connection error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        env: {
          mongodbUri: process.env.MONGODB_URI ? "Set (hidden)" : "NOT SET",
          nextauthSecret: process.env.NEXTAUTH_SECRET ? "Set (hidden)" : "NOT SET",
          nextauthUrl: process.env.NEXTAUTH_URL || "NOT SET",
        },
      },
      { status: 500 }
    )
  }
}
