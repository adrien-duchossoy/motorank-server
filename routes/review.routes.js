const router = require("express").Router()
const Review = require("../models/Review.model")
const Moto = require("../models/Moto.model")
const User = require("../models/User.model")
const { verifyToken } = require("../middlewares/auth.middlewares")
const createEvent = require("../utils/createEvent")


// GET MY OWN REVIEWS
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const reviews = await Review.find({ userId: req.payload._id })
      .populate("motorcycleId", "brandName modelName productionYear picture slug")
      .sort({ createdAt: -1 })
    res.status(200).json(reviews)
  } catch (error) {
    next(error)
  }
})


// GET A SPECIFIC REVIEW
router.get("/:id", async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "handle displayName profilePicture status")
      .populate("motorcycleId", "brandName modelName productionYear picture slug")
    if (!review) {
      return res.status(404).json({ errorMessage: "Review not found" })
    }
    res.status(200).json(review)
  } catch (error) {
    next(error)
  }
})


// GET ALL REVIEWS FOR A MOTO
router.get("/moto/:motorcycleId", async (req, res, next) => {
  try {
    const reviews = await Review.find({ motorcycleId: req.params.motorcycleId })
      .populate("userId", "handle displayName profilePicture status")
    res.status(200).json(reviews)
  } catch (error) {
    next(error)
  }
})


// CREATE A REVIEW
router.post("/", verifyToken, async (req, res, next) => {
  const { motorcycleId, rating, comment, media } = req.body

  try {
    const review = await Review.create({
      motorcycleId,
      userId: req.payload._id,
      rating,
      comment,
      media,
    })

    // Update moto averageRating and ratingCount
    const moto = await Moto.findById(motorcycleId)
    const newRatingCount = moto.ratingCount + 1
    const newAverageRating = ((moto.averageRating * moto.ratingCount) + rating) / newRatingCount
    await Moto.findByIdAndUpdate(motorcycleId, {
      ratingCount: newRatingCount,
      averageRating: Math.round(newAverageRating * 10) / 10,
    })

    // Increment user reviewCount and grant verified badge at exactly 5 reviews
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { $inc: { reviewCount: 1 } },
      { new: true, projection: { reviewCount: 1, status: 1 } }
    )
    if (updatedUser.reviewCount === 5 && updatedUser.status === "user") {
      await User.findByIdAndUpdate(req.payload._id, { status: "verified" })
    }

    try {
      await createEvent(
        req.payload._id,
        "new_review",
        review._id,
        `posted a new review of the ${moto.brandName} ${moto.modelName} ${moto.productionYear}`,
        { rating, comment, motoPicture: moto.picture }
      )
    } catch (_) {}

    res.status(201).json(review)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ errorMessage: "You have already reviewed this motorcycle" })
    }
    next(error)
  }
})


// EDIT OWN REVIEW
router.patch("/:id", verifyToken, async (req, res, next) => {
  const { rating, comment, media } = req.body

  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.payload._id })
    if (!review) {
      return res.status(404).json({ errorMessage: "Review not found" })
    }

    const oldRating = review.rating

    if (rating !== undefined) review.rating = rating
    if (comment !== undefined) review.comment = comment
    if (media !== undefined) review.media = media

    await review.save()

    // Recalculate averageRating if rating changed
    if (rating !== undefined && rating !== oldRating) {
      const moto = await Moto.findById(review.motorcycleId)
      const newAverageRating = ((moto.averageRating * moto.ratingCount) - oldRating + rating) / moto.ratingCount
      await Moto.findByIdAndUpdate(review.motorcycleId, {
        averageRating: Math.round(newAverageRating * 10) / 10,
      })
    }

    res.status(200).json(review)
  } catch (error) {
    next(error)
  }
})


// DELETE OWN REVIEW
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.payload._id })
    if (!review) {
      return res.status(404).json({ errorMessage: "Review not found" })
    }

    // Recalculate averageRating and ratingCount
    const moto = await Moto.findById(review.motorcycleId)
    const newRatingCount = moto.ratingCount - 1
    const newAverageRating = newRatingCount === 0
      ? 0
      : ((moto.averageRating * moto.ratingCount) - review.rating) / newRatingCount
    await Moto.findByIdAndUpdate(review.motorcycleId, {
      ratingCount: newRatingCount,
      averageRating: Math.round(newAverageRating * 10) / 10,
    })

    res.status(200).json({ message: "Review deleted successfully" })
  } catch (error) {
    next(error)
  }
})


module.exports = router
