const router = require("express").Router()
const Event = require("../models/Event.model")
const User = require("../models/User.model")
const { verifyToken } = require("../middlewares/auth.middlewares")


// GET MY FEED (events from people I follow)
router.get("/feed", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id, { following: 1 })
    const events = await Event.find({ actorId: { $in: user.following } })
      .populate("actorId", "handle displayName profilePicture status")
      .sort({ createdAt: -1 })
      .limit(50)
    res.status(200).json(events)
  } catch (error) {
    next(error)
  }
})


// GET MY OWN ACTIVITY
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const events = await Event.find({ actorId: req.payload._id })
      .sort({ createdAt: -1 })
      .limit(50)
    res.status(200).json(events)
  } catch (error) {
    next(error)
  }
})


// TOGGLE LIKE ON AN EVENT
router.post("/:id/like", verifyToken, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id, { likes: 1 })
    if (!event) {
      return res.status(404).json({ errorMessage: "Event not found" })
    }

    const userId = req.payload._id
    const hasLiked = event.likes.some((id) => id.toString() === userId)

    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true, projection: { likes: 1 } }
    )

    res.status(200).json({ likes: updated.likes, liked: !hasLiked })
  } catch (error) {
    next(error)
  }
})


module.exports = router
