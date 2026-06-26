const { Schema, model } = require("mongoose")


const garageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    motorcycleId: {
      type: Schema.Types.ObjectId,
      ref: "Moto",
      required: [true, "Motorcycle is required."],
    },
    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

garageSchema.index({ userId: 1, motorcycleId: 1 }, { unique: true })


const Garage = model("Garage", garageSchema)
module.exports = Garage
