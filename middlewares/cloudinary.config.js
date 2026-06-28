// Require the cloudinary library
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ["jpg", "png", "webp"],
    folder: "motorank",
    transformation: [
      { effect: "trim" },
      { quality: "auto:best" },
      { fetch_format: "auto" },
      { effect: "contrast:15" },
      { effect: "brightness:-5" },
    ]
  },
});

module.exports = multer({ storage });
