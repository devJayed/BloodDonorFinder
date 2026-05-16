import crypto from "crypto"
import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPasswordResetToken extends Document {
  email: string
  otpHash: string
  resetTokenHash?: string
  expiresAt: Date
  resetTokenExpiresAt?: Date
  verifiedAt?: Date
  usedAt?: Date
  attempts: number
  createdAt: Date
  updatedAt: Date
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    resetTokenHash: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    resetTokenExpiresAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    usedAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

export function hashResetSecret(value: string) {
  return crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "password-reset")
    .update(value)
    .digest("hex")
}

const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  )

export default PasswordResetToken
