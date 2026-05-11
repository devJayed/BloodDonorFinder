import type { BloodGroup } from "@/lib/types"
import mongoose, { Document, Model, Schema } from "mongoose"

export interface IDonor extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  fatherName: string
  motherName?: string | null
  profileImage?: string | null
  address: string | null
  mobile: string
  age?: number | null
  weight?: number | null
  gender?: "male" | "female" | "other" | null
  dateOfBirth: Date | null
  bloodGroup: BloodGroup | null
  lastDonationDate?: Date | null
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const DonorSchema = new Schema<IDonor>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
      default: "",
    },
    motherName: {
      type: String,
      trim: true,
      default: null,
    },
    profileImage: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      min: [1, "Weight must be greater than 0"],
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
      default: null,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Add indexes for faster queries
DonorSchema.index({ bloodGroup: 1 })
DonorSchema.index({ address: 1 })
DonorSchema.index({ createdBy: 1 })

const Donor: Model<IDonor> =
  mongoose.models.Donor || mongoose.model<IDonor>("Donor", DonorSchema)

export default Donor
