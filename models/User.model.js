// ❗This is an example of a User Model. 
// TODO: Please make sure you edit the User model to whatever makes sense in your project.

const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    handle: {
      type: String,
      required: [true, 'Choose a handle.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_-]+$/gm, 'Invalid handle']
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
    profile_picture: {
      type: String,
    },
    status: {
      type: String,
      enum: ["user", "verified"],
      default: "user"
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`    
    timestamps: true
  }
);


// handle: String (unique)
// email: String
// password: String (hashed)
// profile_picture: String (URL Cloudinary)
// description: String
// is_verified: Boolean (default: false)
// favorites: [ObjectId] (ref → Motorcycle)
// followers: [ObjectId] (ref → User)
// following: [ObjectId] (ref → User)
// created_at: Date
// updated_at: Date 













const User = model("User", userSchema);

module.exports = User;
