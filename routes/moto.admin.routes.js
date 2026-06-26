const router = require("express").Router()
const Moto = require("../models/Moto.model")
const { verifyToken, verifyStatus, verifyAdmin } = require("../middlewares/auth.middlewares")


// CREATE MOTO
router.post("/", verifyToken, verifyStatus, async (req, res, next) => {
  const { brandName, modelName, productionYear, type, cylinder, horsepower, torqueNm, weightKg, picture } = req.body

  try {
    const moto = new Moto({ brandName, modelName, productionYear, type, cylinder, horsepower, torqueNm, weightKg, picture })
    const savedMoto = await moto.save()
    res.status(201).json(savedMoto)
  } catch (error) {
    next(error)
  }
})


// EDIT MOTO
router.patch("/:id", verifyToken, verifyStatus, async (req, res, next) => {
  const { brandName, modelName, productionYear, type, cylinder, horsepower, torqueNm, weightKg, picture } = req.body

  try {
    const moto = await Moto.findById(req.params.id)
    if (!moto) {
      return res.status(404).json({ errorMessage: "Moto not found" })
    }

    if (brandName !== undefined) moto.brandName = brandName
    if (modelName !== undefined) moto.modelName = modelName
    if (productionYear !== undefined) moto.productionYear = productionYear
    if (type !== undefined) moto.type = type
    if (cylinder !== undefined) moto.cylinder = cylinder
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


module.exports = router
