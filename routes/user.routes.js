const router = require("express").Router()
const User = require("../models/User.model")
const bcrypt = require("bcryptjs")
const { verifyToken } = require("../middlewares/auth.middlewares")


router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.payload._id, { password: 0 })
    res.status(200).json(foundUser)
  } catch (error) {
    next(error)
  }
})


// UPDATE GENERAL PROFILE (displayName, description)
router.patch("/me", verifyToken, async (req, res, next) => {
  const { displayName, description } = req.body

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { displayName, description },
      { new: true, projection: { password: 0 } },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})


// CHANGE EMAIL
router.patch("/me/email", verifyToken, async (req, res, next) => {
  const { email } = req.body

  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gm
  if (emailRegex.test(email) === false) {
    return res.status(400).json({ errorMessage: "Email is not valid" })
  }

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ errorMessage: "This email is already used with an existing account" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { email },
      { new: true, projection: { password: 0 } },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})


// CHANGE HANDLE
router.patch("/me/handle", verifyToken, async (req, res, next) => {
  const { handle } = req.body

  const handleRegex = /^[a-z0-9_-]+$/gm
  if (handleRegex.test(handle) === false) {
    return res.status(400).json({ errorMessage: "Handle must only contain lowercase, numbers and - or _" })
  }

  try {
    const existingUser = await User.findOne({ handle })
    if (existingUser) {
      return res.status(400).json({ errorMessage: "This handle is already taken" })
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { handle },
      { new: true, projection: { password: 0 } },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})


// CHANGE PASSWORD
router.patch("/me/password", verifyToken, async (req, res, next) => {
  const { currentPassword, newPassword } = req.body

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
  if (passwordRegex.test(newPassword) === false) {
    return res.status(400).json({ errorMessage: "Password is not strong enough. Needs to have at least one digit, one uppercase, one lowercase and 8 characters of length." })
  }

  try {
    const foundUser = await User.findById(req.payload._id)

    const isPasswordCorrect = await bcrypt.compare(currentPassword, foundUser.password)
    if (!isPasswordCorrect) {
      return res.status(400).json({ errorMessage: "Current password is not correct" })
    }

    const hashPassword = await bcrypt.hash(newPassword, 12)
    await User.findByIdAndUpdate(req.payload._id, { password: hashPassword })
    res.status(200).json({ message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
})


// CHANGE PROFILE PICTURE
router.patch("/me/picture", verifyToken, async (req, res, next) => {
  const { profilePicture } = req.body

  if (!profilePicture || typeof profilePicture !== "string") {
    return res.status(400).json({ errorMessage: "Invalid image URL" })
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { profilePicture },
      { new: true, projection: { password: 0 } },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})


// FOLLOW
router.post("/me/following/:targetId", verifyToken, async (req, res, next) => {
  try {
    const { targetId } = req.params
    const followerId = req.payload._id

    if (targetId === followerId.toString()) {
      return res.status(400).json({ errorMessage: "You cannot follow yourself" })
    }
    await Promise.all([
      User.findByIdAndUpdate(targetId, { $addToSet: { followers: followerId } }),
      User.findByIdAndUpdate(followerId, { $addToSet: { following: targetId } }),
    ])
    res.status(200).json({ message: "Followed" })
  } catch (error) {
    next(error)
  }
})

// UNFOLLOW
router.delete("/me/following/:targetId", verifyToken, async (req, res, next) => {
  try {
    const { targetId } = req.params
    const followerId = req.payload._id
    await Promise.all([
      User.findByIdAndUpdate(targetId, { $pull: { followers: followerId } }),
      User.findByIdAndUpdate(followerId, { $pull: { following: targetId } }),
    ])
    res.status(200).json({ message: "Unfollowed" })
  } catch (error) {
    next(error)
  }
})

// FOLLOWERS
router.get("/me/followers", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id).populate("followers", "handle displayName profilePicture")
    res.status(200).json(user.followers)
  } catch (error) {
    next(error)
  }
})

// FOLLOWING
router.get("/me/following", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.payload._id).populate("following", "handle displayName profilePicture")
    res.status(200).json(user.following)
  } catch (error) {
    next(error)
  }
})

module.exports = router
