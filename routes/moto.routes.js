const router = require("express").Router()
const Moto = require("../models/Moto.model")
const Fuse = require("fuse.js")


// GET ALL MOTOS (filters + search)
router.get("/", async (req, res, next) => {
  const { brand, type, cylinder, minYear, maxYear, minHp, maxHp, search } = req.query

  try {
    const query = {}

    if (brand) query.brandName = brand
    if (type) query.type = type
    if (cylinder) query.cylinder = Number(cylinder)
    if (minYear || maxYear) {
      query.productionYear = {}
      if (minYear) query.productionYear.$gte = Number(minYear)
      if (maxYear) query.productionYear.$lte = Number(maxYear)
    }
    if (minHp || maxHp) {
      query.horsepower = {}
      if (minHp) query.horsepower.$gte = Number(minHp)
      if (maxHp) query.horsepower.$lte = Number(maxHp)
    }

    const motos = await Moto.find(query)

    if (!search) {
      return res.status(200).json(motos)
    }

    const fuse = new Fuse(motos, {
      keys: ["brandName", "modelName"],
      threshold: 0.4,
      ignoreLocation: true,
    })

    const results = fuse.search(search).map((result) => result.item)
    res.status(200).json(results)
  } catch (error) {
    next(error)
  }
})


// GET ONE MOTO BY SLUG
router.get("/:slug", async (req, res, next) => {
  try {
    const moto = await Moto.findOne({ slug: req.params.slug })
    if (!moto) {
      return res.status(404).json({ errorMessage: "Moto not found" })
    }
    res.status(200).json(moto)
  } catch (error) {
    next(error)
  }
})


module.exports = router
