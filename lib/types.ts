export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER"

export interface User {
  id: string
  name: string
  email: string
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
  motherName: string
  address: string
  mobile: string
  age: number
  dateOfBirth: string | null
  bloodGroup: BloodGroup | null
  lastDonationDate: string | null
  createdBy: string
}

export interface Address {
  id: string
  label: string
  isActive: boolean
}
