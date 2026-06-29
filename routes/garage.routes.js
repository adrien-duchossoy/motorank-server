const router = require("express").Router()
const Garage = require("../models/Garage.model")
const { verifyToken } = require("../middlewares/auth.middlewares")
const createEvent = require("../utils/createEvent")


// GET MY GARAGE
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const entries = await Garage.find({ userId: req.payload._id }).populate("motorcycleId")
    res.status(200).json(entries)
  } catch (error) {
    next(error)
  }
})

// GET A GARAGE ENTRY
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const entry = await Garage.findOne({ _id: req.params.id }).populate("motorcycleId")
    if (!entry) {
      return res.status(404).json({ errorMessage: "Garage entry not found" })
    }
    res.status(200).json(entry)
  } catch (error) {
    next(error)
  }
})


// ADD A MOTO TO MY GARAGE
router.post("/", verifyToken, async (req, res, next) => {
  const { motorcycleId } = req.body

  try {
    const entry = await Garage.create({ userId: req.payload._id, motorcycleId })
    const populated = await entry.populate("motorcycleId", "brandName modelName productionYear")

    try {
      const { brandName, modelName, productionYear } = populated.motorcycleId
      await createEvent(
        req.payload._id,
        "garage_add",
        entry._id,
        `@${req.payload.handle} added the ${brandName} ${modelName} ${productionYear} to their garage`,
        { motoPicture: populated.motorcycleId.picture }
      )
    } catch (_) {}

    res.status(201).json(entry)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ errorMessage: "This motorcycle is already in your garage" })
    }
    next(error)
  }
})


// ADD PHOTOS TO A GARAGE ENTRY
router.post("/:id/photos", verifyToken, async (req, res, next) => {
  const { photos } = req.body

  try {
    const entry = await Garage.findOne({ _id: req.params.id, userId: req.payload._id })
    if (!entry) {
      return res.status(404).json({ errorMessage: "Garage entry not found" })
    }

    entry.photos.push(...photos)
    await entry.save()
    res.status(200).json(entry)
  } catch (error) {
    next(error)
  }
})


// REMOVE A PHOTO FROM A GARAGE ENTRY
router.delete("/:id/photos", verifyToken, async (req, res, next) => {
  const { photoUrl } = req.body

  try {
    const entry = await Garage.findOneAndUpdate(
      { _id: req.params.id, userId: req.payload._id },
      { $pull: { photos: photoUrl } },
      { new: true }
    )
    if (!entry) {
      return res.status(404).json({ errorMessage: "Garage entry not found" })
    }
    res.status(200).json(entry)
  } catch (error) {
    next(error)
  }
})


// REMOVE A MOTO FROM MY GARAGE
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const entry = await Garage.findOneAndDelete({ _id: req.params.id, userId: req.payload._id })
    if (!entry) {
      return res.status(404).json({ errorMessage: "Garage entry not found" })
    }
    res.status(200).json({ message: "Motorcycle removed from garage" })
  } catch (error) {
    next(error)
  }
})


module.exports = router
