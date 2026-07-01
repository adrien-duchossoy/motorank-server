const router = require("express").Router()
const Moto = require("../models/Moto.model")
const { verifyToken, verifyStatus, verifyAdmin } = require("../middlewares/auth.middlewares")
const Anthropic = require("@anthropic-ai/sdk")
const cloudinary = require("cloudinary").v2
const { motoTypes } = require("../constants/moto.enums")
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })


// CREATE MOTO
router.post("/", verifyToken, verifyStatus, async (req, res, next) => {
  const { brandName, modelName, productionYear, type, cylinders, displacement, horsepower, torqueNm, weightKg, picture } = req.body

  try {
    const moto = new Moto({ brandName, modelName, productionYear, type, cylinders, displacement, horsepower, torqueNm, weightKg, picture })
    const savedMoto = await moto.save()
    res.status(201).json(savedMoto)
  } catch (error) {
    next(error)
  }
})


// EDIT MOTO
router.patch("/:id", verifyToken, verifyStatus, async (req, res, next) => {
  const { brandName, modelName, productionYear, type, cylinders, displacement, horsepower, torqueNm, weightKg, picture } = req.body

  try {
    const moto = await Moto.findById(req.params.id)
    if (!moto) {
      return res.status(404).json({ errorMessage: "Moto not found" })
    }

    if (brandName !== undefined) moto.brandName = brandName
    if (modelName !== undefined) moto.modelName = modelName
    if (productionYear !== undefined) moto.productionYear = productionYear
    if (type !== undefined) moto.type = type
    if (cylinders !== undefined) moto.cylinders = cylinders
    if (displacement !== undefined) moto.displacement = displacement
    if (horsepower !== undefined) moto.horsepower = horsepower
    if (torqueNm !== undefined) moto.torqueNm = torqueNm
    if (weightKg !== undefined) moto.weightKg = weightKg
    if (picture !== undefined) moto.picture = picture

    const updatedMoto = await moto.save()
    res.status(200).json(updatedMoto)
  } catch (error) {
    next(error)
  }
})


// DELETE MOTO
router.delete("/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const moto = await Moto.findByIdAndDelete(req.params.id)
    if (!moto) {
      return res.status(404).json({ errorMessage: "Moto not found" })
    }
    res.status(200).json({ message: "Moto deleted successfully" })
  } catch (error) {
    next(error)
  }
})


//AI MOTO SPEC FILL
router.post("/ai-suggest", verifyToken, verifyStatus, async(req, res, next) => {
  const { brandName, modelName, productionYear } = req.body

  if(!brandName || !modelName || !productionYear) {
    return res.status(400).json({ errorMessage: "Brand, model and year are required"})
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      tools: [{
        name: "fill_moto_specs",
        description: "Provide the technical specifications of a motorcycle based on its brand, model and year.",
        input_schema: {
          type:"object",
          properties: {
            type: { type:"string", enum: motoTypes, description: "Category of the motorcycle"},
            cylinders: { type: "number", description:"Number of engine cylinders"},
            displacement: { type: "number", description:"Engine displacement in cc"},
            horsepower: { type: "number", description: "Max power in HP" },
            torqueNm: { type: "number", description: "Max torque in Nm" },
            weightKg: { type: "number", description: "Weight in kg" }
          },
          required: ["type", "displacement", "horsepower", "torqueNm", "weightKg"]
        }
      }],
      tool_choice: { type: "tool", name: "fill_moto_specs" },
      messages: [{
        role: "user",
        content: `What are the technical specifications of the  ${productionYear} ${brandName} ${modelName} ?`
      }]
    })
    const toolUseBlock = response.content.find(block => block.type === "tool_use")
    if (!toolUseBlock) {
      return res.status(500).json({errorMessage:"Could not retrieve specifications for this bike"})
    }
    res.status(200).json(toolUseBlock.input)
  } catch (error) {
    next(error)
  }
})

// IMAGE SUGGEST
router.post("/image-suggest", verifyToken, verifyStatus, async (req, res, next) => {
  const { brandName, modelName, productionYear } = req.body

  if (!brandName || !modelName || !productionYear) {
    return res.status(400).json({ errorMessage: "Brand, model and year are required" })
  }

  try {
    const query = encodeURIComponent(`${brandName} ${modelName} ${productionYear} motorcycle`)
    const url = `https://serpapi.com/search.json?engine=google_images&q=${query}&imgsz=l&api_key=${process.env.SERPAPI_KEY}`

    const response = await fetch(url)
    const data = await response.json()
    if (!data.images_results || data.images_results.length === 0) {
      return res.status(404).json({ errorMessage: "No image found for this motorcycle" })
    }

    let cloudinaryResult = null
    for (const image of data.images_results.slice(0, 5)) {
      try {
        cloudinaryResult = await cloudinary.uploader.upload(image.original, {
          folder: "motorank",
          resource_type: "image",
        })
        break
      } catch {
        continue
      }
    }

    if (!cloudinaryResult) {
      return res.status(404).json({ errorMessage: "No accessible image found for this motorcycle" })
    }

    res.status(200).json({ imageUrl: cloudinaryResult.secure_url })
  } catch (error) {
    next(error)
  }
})




module.exports = router
