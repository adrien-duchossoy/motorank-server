const { Schema, model } = require("mongoose")
const { brandNames, motoTypes } = require("../constants/moto.enums")


const motoSchema = new Schema(
  {
    brandName: {
      type: String,
      enum: brandNames,
      required: [true, "Brand name is required."],
    },
    modelName: {
      type: String,
      required: [true, "Model name is required."],
      trim: true,
    },
    productionYear: {
      type: Number,
      required: [true, "Production year is required."],
    },
    type: {
      type: String,
      enum: motoTypes,
      required: [true, "Moto type is required."],
    },
    cylinders: {
      type: Number,
    },
    displacement: {
      type: Number,
    },
    horsepower: {
      type: Number,
    },
    torqueNm: {
      type: Number,
    },
    weightKg: {
      type: Number,
    },
    picture: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

//Slug creation at save
motoSchema.pre("save", function (next) {
  this.slug = `${this.brandName}-${this.modelName}-${this.productionYear}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  next()
})


const Moto = model("Moto", motoSchema)
module.exports = Moto
