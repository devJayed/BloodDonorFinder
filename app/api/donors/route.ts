import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Donor from "@/models/Donor"
import {
  canManageDonors,
  hasPermission,
  maskMobileNumber,
} from "@/lib/permissions"
import { authorize } from "@/lib/server-permissions"

// GET /api/donors - Get all donors
export async function GET() {
  try {
    const { session } = await authorize("donor:view")

    // Even guests can view donors (but with masked mobile)
    const canViewFullMobile = session?.user
      ? hasPermission(session.user.role, "donor:view_full")
      : false

    await connectToDatabase()
    const dbDonors = await Donor.find().sort({ createdAt: -1 }).lean()

    const donors = dbDonors.map((donor) => ({
      id: donor._id.toString(),
      name: donor.name,
      fatherName: donor.fatherName,
      motherName: donor.motherName,
      address: donor.address,
      mobile: maskMobileNumber(donor.mobile, canViewFullMobile),
      age: donor.age,
      dateOfBirth: donor.dateOfBirth?.toISOString() || null,
      bloodGroup: donor.bloodGroup,
      lastDonationDate: donor.lastDonationDate?.toISOString() || null,
      createdBy: donor.createdBy.toString(),
    }))

    return NextResponse.json({ donors })
  } catch (error) {
    console.error("Get donors error:", error)
    return NextResponse.json(
      { error: "Failed to fetch donors" },
      { status: 500 }
    )
  }
}

// POST /api/donors - Create a new donor
export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await authorize("donor:create")

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to add donors." },
        { status: 401 }
      )
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "You are not allowed to add donors." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      fatherName,
      motherName,
      address,
      mobile,
      age,
      dateOfBirth,
      bloodGroup,
      lastDonationDate,
      createdBy,
    } = body

    // Validate required fields
    if (!name || !fatherName || !motherName || !address || !mobile || !age) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const isAdmin = canManageDonors(session.user.role)
    const ownerId = isAdmin && createdBy ? createdBy : session.user.id

    if (!isAdmin) {
      const existingOwnDonor = await Donor.findOne({ createdBy: session.user.id })

      if (existingOwnDonor) {
        return NextResponse.json(
          {
            error: "Your donor profile already exists. Please update it instead.",
            donorId: existingOwnDonor._id.toString(),
          },
          { status: 409 }
        )
      }
    }

    const donor = await Donor.create({
      name,
      fatherName,
      motherName,
      address,
      mobile,
      age: parseInt(age),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      bloodGroup: bloodGroup || null,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null,
      createdBy: ownerId,
    })

    return NextResponse.json(
      {
        message: "Donor created successfully",
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create donor error:", error)
    return NextResponse.json(
      { error: "Failed to create donor" },
      { status: 500 }
    )
  }
}
