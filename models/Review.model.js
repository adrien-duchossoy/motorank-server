const { Schema, model } = require("mongoose")


const reviewSchema = new Schema(
  {
    motorcycleId: {
      type: Schema.Types.ObjectId,
      ref: "Moto",
      required: [true, "Motorcycle is required."],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    media: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

reviewSchema.index({ userId: 1, motorcycleId: 1 }, { unique: true })


const Review = model("Review", reviewSchema)
module.exports = Review
