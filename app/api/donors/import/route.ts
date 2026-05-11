import { connectToDatabase } from "@/lib/mongodb"
import { canManageDonors } from "@/lib/permissions"
import { authorize } from "@/lib/server-permissions"
import type { BloodGroup } from "@/lib/types"
import Donor from "@/models/Donor"
import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

const bloodGroups: BloodGroup[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]

const columnAliases = {
  name: ["name", "full name", "donor name"],
  fatherName: ["father name", "fathername", "father's name"],
  motherName: ["mother name", "mothername", "mother's name"],
  profileImage: ["profile image", "profileimage", "image", "image url", "photo"],
  address: ["address", "location", "area"],
  mobile: ["mobile", "phone", "phone number", "mobile number", "contact"],
  age: ["age"],
  weight: ["weight", "weight kg", "weight (kg)"],
  gender: ["gender", "sex"],
  dateOfBirth: ["date of birth", "dateofbirth", "dob", "birth date"],
  bloodGroup: ["blood group", "bloodgroup", "blood"],
  lastDonationDate: [
    "last donation date",
    "lastdonationdate",
    "last donation",
    "donation date",
  ],
} as const

type DonorImportField = keyof typeof columnAliases
type ImportRow = Record<string, unknown>
type ImportedDonor = {
  name: string
  fatherName: string
  motherName: string | null
  profileImage: string | null
  address: string
  mobile: string
  age: number | null
  weight: number | null
  gender: "male" | "female" | "other" | null
  dateOfBirth: Date | null
  bloodGroup: BloodGroup | null
  lastDonationDate: Date | null
  createdBy: string
}
type ParsedDonor = ImportedDonor & {
  sourceRow: number
}
type DonorDuplicateFields = {
  name?: string | null
  bloodGroup?: BloodGroup | null
  address?: string | null
  mobile?: string | null
}

function normalizeBanglaDigits(value: string) {
  const digits: Record<string, string> = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  }

  return value.replace(/[০-৯]/g, (digit) => digits[digit] ?? digit)
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
}

function getCell(row: ImportRow, field: DonorImportField) {
  const aliases = columnAliases[field].map(normalizeHeader)
  const key = Object.keys(row).find((header) =>
    aliases.includes(normalizeHeader(header))
  )

  return key ? row[key] : undefined
}

function parseOptionalString(value: unknown) {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text || null
}

function parseOptionalMobile(value: unknown) {
  const mobile = parseOptionalString(value)
  if (!mobile) return null

  const normalizedMobile = normalizeBanglaDigits(mobile)
  return normalizedMobile.startsWith("0")
    ? normalizedMobile
    : `0${normalizedMobile}`
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(normalizeBanglaDigits(String(value).trim()))
  return Number.isFinite(parsed) ? parsed : null
}

function parseOptionalGender(value: unknown) {
  const gender = parseOptionalString(value)?.toLowerCase()
  return gender === "male" || gender === "female" || gender === "other"
    ? gender
    : null
}

function parseOptionalBloodGroup(value: unknown) {
  const bloodGroup = parseOptionalString(value)?.toUpperCase()
  return bloodGroups.includes(bloodGroup as BloodGroup)
    ? (bloodGroup as BloodGroup)
    : null
}

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (!parsed) return null
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
  }

  const date = new Date(String(value).trim())
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeDuplicateValue(value: string | null | undefined) {
  return normalizeBanglaDigits(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

function normalizeDuplicateMobile(value: string | null | undefined) {
  return parseOptionalMobile(value) ?? ""
}

function getDuplicateKey(donor: DonorDuplicateFields) {
  return [
    normalizeDuplicateValue(donor.name),
    normalizeDuplicateValue(donor.bloodGroup),
    normalizeDuplicateValue(donor.address),
    normalizeDuplicateMobile(donor.mobile),
  ].join("|")
}

// POST /api/donors/import - Import donors from an Excel file.
export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await authorize("donor:create")

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!authorized || !canManageDonors(session.user.role)) {
      return NextResponse.json(
        { error: "Only admins can import donors." },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an Excel file." },
        { status: 400 }
      )
    }

    const fileName = file.name.toLowerCase()

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Only .xlsx and .xls files are supported." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { cellDates: true, type: "buffer" })
    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      return NextResponse.json(
        { error: "The Excel file does not contain any sheets." },
        { status: 400 }
      )
    }

    const rows = XLSX.utils.sheet_to_json<ImportRow>(
      workbook.Sheets[firstSheetName],
      { defval: "" }
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "The Excel sheet does not contain donor rows." },
        { status: 400 }
      )
    }

    const parsedDonors: ParsedDonor[] = []
    const skippedRows: Array<{ row: number; reason: string }> = []

    rows.forEach((row, index) => {
      const name = parseOptionalString(getCell(row, "name"))
      const fatherName = parseOptionalString(getCell(row, "fatherName"))
      const address = parseOptionalString(getCell(row, "address"))
      const mobile = parseOptionalMobile(getCell(row, "mobile"))
      const dateOfBirth = parseOptionalDate(getCell(row, "dateOfBirth"))
      const bloodGroup = parseOptionalBloodGroup(getCell(row, "bloodGroup"))

      if (!name) {
        skippedRows.push({
          row: index + 2,
          reason: "Missing name.",
        })
        return
      }

      parsedDonors.push({
        sourceRow: index + 2,
        name,
        fatherName: fatherName ?? "",
        motherName: parseOptionalString(getCell(row, "motherName")),
        profileImage: parseOptionalString(getCell(row, "profileImage")),
        address: address ?? "",
        mobile: mobile ?? "",
        age: parseOptionalNumber(getCell(row, "age")),
        weight: parseOptionalNumber(getCell(row, "weight")),
        gender: parseOptionalGender(getCell(row, "gender")),
        dateOfBirth,
        bloodGroup,
        lastDonationDate: parseOptionalDate(getCell(row, "lastDonationDate")),
        createdBy: session.user.id,
      })
    })

    if (parsedDonors.length === 0) {
      return NextResponse.json(
        {
          error: "No donor rows were found.",
          skippedRows,
        },
        { status: 400 }
      )
    }

    await connectToDatabase()
    const existingDonors = await Donor.find({})
      .select("name bloodGroup address mobile")
      .lean<DonorDuplicateFields[]>()
    const duplicateKeys = new Set(existingDonors.map(getDuplicateKey))
    const fileDuplicateKeys = new Set<string>()
    const donors: ImportedDonor[] = []

    parsedDonors.forEach(({ sourceRow, ...donor }) => {
      const duplicateKey = getDuplicateKey(donor)

      if (duplicateKeys.has(duplicateKey) || fileDuplicateKeys.has(duplicateKey)) {
        skippedRows.push({
          row: sourceRow,
          reason: "Duplicate donor with same name, blood group, address, and mobile.",
        })
        return
      }

      fileDuplicateKeys.add(duplicateKey)
      donors.push(donor)
    })

    if (donors.length === 0) {
      return NextResponse.json(
        {
          error: "No new donor rows were found.",
          skippedRows,
        },
        { status: 400 }
      )
    }

    await Donor.insertMany(donors, { ordered: false })

    return NextResponse.json({
      message: "Donors imported successfully",
      imported: donors.length,
      skipped: skippedRows.length,
      skippedRows,
    })
  } catch (error) {
    console.error("Import donors error:", error)
    return NextResponse.json(
      { error: "Failed to import donors." },
      { status: 500 }
    )
  }
}
