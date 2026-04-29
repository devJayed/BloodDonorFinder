import mongoose, { Schema, Document, Model } from "mongoose"
import type { BloodGroup } from "@/lib/types"

export interface IDonor extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  fatherName: string
  motherName: string
  address: string
  mobile: string
  age: number
  dateOfBirth: Date | null
  bloodGroup: BloodGroup | null
  lastDonationDate: Date | null
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
      required: [true, "Father's name is required"],
      trim: true,
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Donor must be at least 18 years old"],
      max: [65, "Donor cannot be older than 65 years"],
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
