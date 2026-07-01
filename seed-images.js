try { process.loadEnvFile() } catch (_) {}

const cloudinary = require("cloudinary").v2
const connectDB = require("./db")
const Moto = require("./models/Moto.model")

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchAndUploadImage(brandName, modelName, productionYear) {
  const query = encodeURIComponent(`${brandName} ${modelName} ${productionYear} motorcycle`)
  const url = `https://serpapi.com/search.json?engine=google_images&q=${query}&imgsz=l&api_key=${process.env.SERPAPI_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  if (!data.images_results || data.images_results.length === 0) return null

  for (const image of data.images_results.slice(0, 5)) {
    try {
      const result = await cloudinary.uploader.upload(image.original, {
        folder: "motorank",
        resource_type: "image",
      })
      return result.secure_url
    } catch {
      continue
    }
  }
  return null
}

async function seedImages() {
  await connectDB()

  // only process motos without a picture
  const motos = await Moto.find({ picture: { $in: [null, undefined, ""] } }, "_id brandName modelName productionYear")
  console.log(`Found ${motos.length} motos without a picture`)

  let success = 0
  let failed = 0

  for (let i = 0; i < motos.length; i++) {
    const moto = motos[i]
    const label = `${moto.brandName} ${moto.modelName} ${moto.productionYear}`
    process.stdout.write(`[${i + 1}/${motos.length}] ${label} ... `)

    try {
      const imageUrl = await fetchAndUploadImage(moto.brandName, moto.modelName, moto.productionYear)
      if (imageUrl) {
        await Moto.findByIdAndUpdate(moto._id, { picture: imageUrl })
        console.log("✓")
        success++
      } else {
        console.log("no image found")
        failed++
      }
    } catch (err) {
      console.log(`error: ${err.message}`)
      failed++
    }

    // avoid hitting SerpAPI rate limit
    if (i < motos.length - 1) await sleep(3000)
  }

  const mongoose = require("mongoose")
  await mongoose.disconnect()
  console.log(`\nDone — ${success} updated, ${failed} failed`)
}

seedImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
