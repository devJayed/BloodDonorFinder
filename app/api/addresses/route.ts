import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Address from "@/models/Address"

export async function GET() {
  try {
    await connectToDatabase()

    const addresses = await Address.find({ isActive: true })
      .sort({ label: 1 })
      .lean()

    return NextResponse.json({
      addresses: addresses.map((address) => ({
        id: address._id.toString(),
        label: address.label,
        isActive: address.isActive,
      })),
    })
  } catch (error) {
    console.error("Get addresses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    )
  }
}
