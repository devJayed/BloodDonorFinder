import type { BloodGroup } from "@/lib/types"

export interface SeedDonor {
  name: string
  fatherName: string
  motherName: string
  address: string
  mobile: string
  age: number
  dateOfBirth: Date | null
  bloodGroup: BloodGroup | null
  lastDonationDate: Date | null
}

export const seedDonors: SeedDonor[] = [
  {
    name: "রিয়া",
    fatherName: "মোঃ আনোয়ার",
    motherName: "রিনা বেগম",
    address: "চাঁনগাজী মজুমদার বাড়ী, লক্ষ্মীপুর",
    mobile: "01741599731",
    age: 18,
    dateOfBirth: null,
    bloodGroup: "B+",
    lastDonationDate: null,
  },
  {
    name: "রিফাত",
    fatherName: "মোঃ আনোয়ার",
    motherName: "রিনা বেগম",
    address: "চাঁনগাজী মজুমদার বাড়ী, লক্ষ্মীপুর",
    mobile: "01741599731",
    age: 18,
    dateOfBirth: null,
    bloodGroup: "B+",
    lastDonationDate: null,
  },
  {
    name: "মোঃ আনোয়ার",
    fatherName: "ফজলুল হক",
    motherName: "লাইলি বেগম",
    address: "চাঁনগাজী মজুমদার বাড়ী, লক্ষ্মীপুর",
    mobile: "01741599731",
    age: 40,
    dateOfBirth: null,
    bloodGroup: null,
    lastDonationDate: null,
  },
]
