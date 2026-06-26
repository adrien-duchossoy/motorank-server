// @ts-nocheck
// ❗This is an example of a User Model.
// TODO: Please make sure you edit the User model to whatever makes sense in your project.

const mongoose = require("mongoose")
const { Schema, model } = mongoose


const userSchema = new Schema(
  {
    handle: {
      type: String,
      required: [true, 'Choose a handle.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    profilePicture: {
      type: String,
    },
    displayName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["user", "verified", "admin"],
      default: "user"
    },
    description: {
      type: String,
    },
    favorites: {
      type: [mongoose.Types.ObjectId],
      ref: "Moto"
    },
    followers: {
      type: [mongoose.Types.ObjectId],
      ref: "User"
    },
    following: {
      type: [mongoose.Types.ObjectId],
      ref: "User"
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);

const User = model("User", userSchema)
module.exports = User
