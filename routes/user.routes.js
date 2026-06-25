const router = require("express").Router()
const User = require("../models/User.model")
const { verifyToken } = require("../middlewares/auth.middlewares")



router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.payload._id, { password: 0 })
    res.status(200).json(foundUser)
  } catch (error) {
    next(error)
  }
})


//MODIFICATION EMAIL ET HANDLE
router.patch("/me", verifyToken, async (req, res, next) => {
  try {
    //validation
    const emailRegex =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gm
    if (emailRegex.test(email) === false) {
      res.status(400).json({ errorMessage: "Email is not valid" })
    }

    const handleRegex = /^[a-z0-9_-]+$/gm
    if (handleRegex.test(handle) === false) {
      res.status(400).json({
        errorMessage: "Handle must only contain lowercase, numbers and - or _",
      })
      return
    }

    //update user email and
    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { handle, email },
      { new: true, runValidators: true },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})

//CHANGE PROFILE PICTURE
router.patch("/me/picture", verifyToken, async (req, res, next) => {
  try {
    const { profile_picture } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      req.payload._id,
      { profile_picture },
      { new: true },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    next(error)
  }
})

module.exports = router
