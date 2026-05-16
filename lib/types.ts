export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER"

export interface User {
  id: string
  name: string
  email?: string
  mobile?: string
  role: UserRole
  createdAt: string
}

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"

export interface Donor {
  id: string
  name: string
  fatherName: string
  motherName: string | null
  profileImage: string | null
  address: string | null
  mobile: string
  age: number | null
  weight: number | null
  gender: "male" | "female" | "other" | null
  dateOfBirth: string | null
  bloodGroup: BloodGroup | null
  lastDonationDate: string | null
  createdBy: string
  createdByName?: string
}

export interface Address {
  id: string
  label: string
  isActive: boolean
}
