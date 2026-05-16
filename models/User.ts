import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"
import type { UserRole } from "@/lib/types"

export type { UserRole }

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email?: string
  mobile?: string
  password?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\+?\d{8,15}$/, "Please enter a valid mobile number"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
    return
  }

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false
  }

  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent model overwrite in development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
