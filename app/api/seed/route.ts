import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { seedDatabase } from "@/lib/seed"

export async function GET() {
  try {
    await dbConnect()
    await seedDatabase({ force: true })

    return NextResponse.json({
      success: true,
      message: "Seeding complete",
      credentials: {
        superAdmin: { email: "superadmin@test.com", password: "password" },
        admin: { email: "admin@test.com", password: "password" },
        user: { email: "user@test.com", password: "password" },
      },
    })
  } catch (error) {
    console.error("Seed API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
