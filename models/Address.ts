import mongoose, { Document, Model, Schema } from "mongoose"

export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId
  label: string
  normalizedLabel: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<IAddress>(
  {
    label: {
      type: String,
      required: [true, "Address label is required"],
      trim: true,
    },
    normalizedLabel: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

AddressSchema.pre("validate", function () {
  this.normalizedLabel = this.label.trim().toLowerCase()
})

AddressSchema.index({ normalizedLabel: 1 }, { unique: true })

const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema)

export default Address
