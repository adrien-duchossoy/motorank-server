const router = require("express").Router()
const User = require("../models/User.model")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { verifyToken } = require("../middlewares/auth.middlewares")


router.post("/signup", async(req, res, next) => {

  const { handle, email, password, displayName } = req.body

  if (!email || !password) {
    res.status(400).json({errorMessage: "Email and Password are required"})
    return
  }

  // the strength of the password
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
  if (passwordRegex.test(password) === false) {
    res.status(400).json({errorMessage: "Password is not strongh enough. Needs to have at least one digit, one uppercase, one lowercase and 8 characters of length."})
    return
  }

  //email format
  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gm
  if (emailRegex.test(email) === false){
    res.status(400).json({errorMessage: "Email is not valid"})
    return
  }

  //handle format
  const handleRegex = /^[a-z0-9_-]+$/gm
  if (handleRegex.test(handle) === false){
    res.status(400).json({errorMessage: "Handle must only contain lowercase, numbers and - or _"})
  }

  try {

    const foundUser = await User.findOne({ $or: [{email}, {handle}] })
    if (foundUser) {
        const message = foundUser.email === email
        ? "This email is already used with an existing account"
        : "This handle is already taken"
      res.status(400).json({errorMessage: message})
      return
    }

    const hashPassword = await bcrypt.hash(password, 12)

    const newUser = {
      handle: handle,
      email: email,
      password: hashPassword,
      displayName: displayName
    }

    await User.create(newUser)

    const newUserInfo = await User.findOne({ email }, { password: 0 })

    res.status(201).json(newUserInfo)
    
  } catch (error) {
    next(error)
  }
})


router.post("/login", async(req, res, next) => {

  const { login, password } = req.body

  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gm
  const isEmail = emailRegex.test(login)


    if (!login || !password) {
    res.status(400).json({errorMessage: "Email and Password are required"})
    return
  }

  try {
    const foundUser = await User.findOne(
        isEmail ? { email: login} : { handle: login}
    )
    if (!foundUser) {
      res.status(400).json({errorMessage: "User not found with that email or username. Please signup first"})
      return
    }

    const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
    if (!isPasswordCorrect) {
      res.status(400).json({errorMessage: "Password is not correct"})
      return
    }

    const payload = {
      _id: foundUser._id,
      email: foundUser.email,
      handle: foundUser.handle,
      status: foundUser.status
    }

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "7d"
    })

    res.status(200).json({authToken: authToken})
  } catch (error) {
    next(error)
  }

})

router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json(req.payload)
})

module.exports = router;