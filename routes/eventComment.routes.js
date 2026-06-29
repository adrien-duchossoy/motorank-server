const router = require("express").Router()
const EventComment = require("../models/EventComment.model")
const { verifyToken } = require("../middlewares/auth.middlewares")


// GET COMMENTS FOR AN EVENT
router.get("/:eventId", async (req, res, next) => {
  try {
    const comments = await EventComment.find({ eventId: req.params.eventId })
      .populate("userId", "handle displayName profilePicture")
      .sort({ createdAt: 1 })
    res.status(200).json(comments)
  } catch (error) {
    next(error)
  }
})


// POST A COMMENT ON AN EVENT
router.post("/:eventId", verifyToken, async (req, res, next) => {
  const { content } = req.body
  try {
    const comment = await EventComment.create({
      eventId: req.params.eventId,
      userId: req.payload._id,
      content,
    })
    await comment.populate("userId", "handle displayName profilePicture")
    res.status(201).json(comment)
  } catch (error) {
    next(error)
  }
})


// EDIT OWN COMMENT
router.patch("/:commentId", verifyToken, async (req, res, next) => {
  const { content } = req.body
  try {
    const comment = await EventComment.findOne({ _id: req.params.commentId, userId: req.payload._id })
    if (!comment) {
      return res.status(404).json({ errorMessage: "Comment not found" })
    }
    comment.content = content
    comment.updatedAt = new Date()
    await comment.save()
    res.status(200).json(comment)
  } catch (error) {
    next(error)
  }
})


// DELETE OWN COMMENT
router.delete("/:commentId", verifyToken, async (req, res, next) => {
  try {
    const comment = await EventComment.findOneAndDelete({ _id: req.params.commentId, userId: req.payload._id })
    if (!comment) {
      return res.status(404).json({ errorMessage: "Comment not found" })
    }
    res.status(200).json({ message: "Comment deleted successfully" })
  } catch (error) {
    next(error)
  }
})


module.exports = router
