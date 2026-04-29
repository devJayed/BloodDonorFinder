import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Donor from "@/models/Donor"
import {
  hasPermission,
  canModifyDonor,
  maskMobileNumber,
} from "@/lib/permissions"
import { authorize } from "@/lib/server-permissions"

// GET /api/donors/[id] - Get a single donor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { session } = await authorize("donor:view")

    const canViewFullMobile = session?.user
      ? hasPermission(session.user.role, "donor:view_full")
      : false

    await connectToDatabase()

    const donor = await Donor.findById(id).lean()

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    return NextResponse.json({
      donor: {
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
      },
    })
  } catch (error) {
    console.error("Get donor error:", error)
    return NextResponse.json(
      { error: "Failed to fetch donor" },
      { status: 500 }
    )
  }
}

// PATCH /api/donors/[id] - Update a donor
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, session } = await authorize("donor:update")

    if (!authorized || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const donor = await Donor.findById(id)

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Check if user can modify this donor
    if (
      !canModifyDonor(
        session.user.role,
        session.user.id,
        donor.createdBy.toString()
      )
    ) {
      return NextResponse.json(
        { error: "You can only modify your own donor profiles" },
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
    } = body

    // Update fields
    if (name) donor.name = name
    if (fatherName) donor.fatherName = fatherName
    if (motherName) donor.motherName = motherName
    if (address) donor.address = address
    if (mobile) donor.mobile = mobile
    if (age) donor.age = parseInt(age)
    if (dateOfBirth !== undefined)
      donor.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    if (bloodGroup !== undefined) donor.bloodGroup = bloodGroup || null
    if (lastDonationDate !== undefined)
      donor.lastDonationDate = lastDonationDate
        ? new Date(lastDonationDate)
        : null

    await donor.save()

    return NextResponse.json({
      message: "Donor updated successfully",
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
      },
    })
  } catch (error) {
    console.error("Update donor error:", error)
    return NextResponse.json(
      { error: "Failed to update donor" },
      { status: 500 }
    )
  }
}

// DELETE /api/donors/[id] - Delete a donor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { authorized, session } = await authorize("donor:delete")

    if (!authorized || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const donor = await Donor.findById(id)

    if (!donor) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 })
    }

    // Only ADMIN and SUPER_ADMIN can delete donors
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete donors" },
        { status: 403 }
      )
    }

    await Donor.findByIdAndDelete(id)

    return NextResponse.json({ message: "Donor deleted successfully" })
  } catch (error) {
    console.error("Delete donor error:", error)
    return NextResponse.json(
      { error: "Failed to delete donor" },
      { status: 500 }
    )
  }
}
