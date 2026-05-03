import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getAuthSession } from "@/lib/server-permissions"
import Donor from "@/models/Donor"

const profileFields = [
  "name",
  "fatherName",
  "motherName",
  "address",
  "mobile",
  "age",
  "dateOfBirth",
  "bloodGroup",
  "lastDonationDate",
] as const

function getCompletion(donor: Record<string, unknown> | null) {
  if (!donor) {
    return 0
  }

  const completed = profileFields.filter((field) => {
    const value = donor[field]
    return value !== null && value !== undefined && value !== ""
  }).length

  return Math.round((completed / profileFields.length) * 100)
}

// GET /api/donors/me - Get current user's donor profile
export async function GET() {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const donor = await Donor.findOne({ createdBy: session.user.id }).lean()

    if (!donor) {
      return NextResponse.json({
        donor: null,
        completionPercentage: 0,
      })
    }

    return NextResponse.json({
      donor: {
        id: donor._id.toString(),
        name: donor.name,
        fatherName: donor.fatherName,
        motherName: donor.motherName,
        address: donor.address,
        mobile: donor.mobile,
        age: donor.age,
        dateOfBirth: donor.dateOfBirth?.toISOString() || null,
        bloodGroup: donor.bloodGroup,
        lastDonationDate: donor.lastDonationDate?.toISOString() || null,
        createdBy: donor.createdBy.toString(),
      },
      completionPercentage: getCompletion(donor),
    })
  } catch (error) {
    console.error("Get own donor profile error:", error)
    return NextResponse.json(
      { error: "Failed to fetch donor profile" },
      { status: 500 }
    )
  }
}
