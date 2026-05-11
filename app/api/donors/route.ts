import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Donor from "@/models/Donor"
import User from "@/models/User"
import {
  canManageDonors,
  hasPermission,
  maskMobileNumber,
} from "@/lib/permissions"
import { authorize } from "@/lib/server-permissions"

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null
  }

  const parsedNumber = Number(value)
  return Number.isFinite(parsedNumber) ? parsedNumber : null
}

function parseOptionalGender(gender: unknown) {
  return gender === "male" || gender === "female" || gender === "other"
    ? gender
    : null
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

// GET /api/donors - Get all donors
export async function GET(request: NextRequest) {
  try {
    const { session } = await authorize("donor:view")
    const { searchParams } = new URL(request.url)
    const page = parsePositiveInteger(searchParams.get("page"), 1)
    const limit = Math.min(
      parsePositiveInteger(searchParams.get("limit"), 12),
      100
    )
    const skip = (page - 1) * limit
    const query = searchParams.get("q")?.trim()
    const bloodGroup = searchParams.get("bloodGroup")
    const address = searchParams.get("address")?.trim()
    const filters: Record<string, unknown> = {}

    if (bloodGroup && bloodGroup !== "all") {
      filters.bloodGroup = bloodGroup
    }

    if (address && address !== "all") {
      filters.address = { $regex: escapeRegex(address), $options: "i" }
    }

    if (query) {
      const searchRegex = { $regex: escapeRegex(query), $options: "i" }
      filters.$or = [
        { name: searchRegex },
        { fatherName: searchRegex },
        { motherName: searchRegex },
        { address: searchRegex },
        { mobile: searchRegex },
        { bloodGroup: searchRegex },
      ]
    }

    // Even guests can view donors (but with masked mobile)
    const canViewFullMobile = session?.user
      ? hasPermission(session.user.role, "donor:view_full")
      : false
    const canViewCreatorName = canManageDonors(session?.user?.role ?? null)

    await connectToDatabase()
    const [dbDonors, totalItems, bloodGroupCount] = await Promise.all([
      Donor.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Donor.countDocuments(filters),
      Donor.distinct("bloodGroup", filters),
    ])
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1)
    const creatorNames = new Map<string, string>()

    if (canViewCreatorName) {
      const creatorIds = [
        ...new Set(dbDonors.map((donor) => donor.createdBy.toString())),
      ]
      const creators = await User.find({ _id: { $in: creatorIds } })
        .select("name")
        .lean()

      creators.forEach((creator) => {
        creatorNames.set(creator._id.toString(), creator.name)
      })
    }

    const donors = dbDonors.map((donor) => {
      const createdBy = donor.createdBy.toString()

      return {
        id: donor._id.toString(),
        name: donor.name,
        fatherName: donor.fatherName,
        motherName: donor.motherName,
        profileImage: donor.profileImage,
        address: donor.address,
        mobile: maskMobileNumber(donor.mobile, canViewFullMobile),
        age: donor.age,
        weight: donor.weight,
        gender: donor.gender,
        dateOfBirth: donor.dateOfBirth?.toISOString() || null,
        bloodGroup: donor.bloodGroup,
        lastDonationDate: donor.lastDonationDate?.toISOString() || null,
        createdBy,
        ...(canViewCreatorName
          ? { createdByName: creatorNames.get(createdBy) || "Unknown user" }
          : {}),
      }
    })

    return NextResponse.json({
      donors,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats: {
        totalDonors: totalItems,
        bloodGroupCount: bloodGroupCount.filter(Boolean).length,
      },
    })
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
      profileImage,
      address,
      mobile,
      age,
      weight,
      gender,
      dateOfBirth,
      bloodGroup,
      lastDonationDate,
      createdBy,
    } = body

    // Validate required fields
    if (!name || !fatherName || !address || !mobile || !dateOfBirth) {
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
      profileImage: profileImage || null,
      address,
      mobile,
      age: parseOptionalNumber(age),
      weight: parseOptionalNumber(weight),
      gender: parseOptionalGender(gender),
      dateOfBirth: new Date(dateOfBirth),
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
          profileImage: donor.profileImage,
          address: donor.address,
          mobile: donor.mobile,
          age: donor.age,
          weight: donor.weight,
          gender: donor.gender,
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
