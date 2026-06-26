const jwt = require("jsonwebtoken")
const User = require("../models/User.model")


function verifyToken(req, res, next) {
  try {
    const authToken = req.headers.authorization.split(" ")[1]
    const payload = jwt.verify(authToken, process.env.TOKEN_SECRET)
    req.payload = payload
    next()
  } catch (error) {
    res.status(401).json({ errorMessage: "Token invalid or doesn't exist" })
  }
}


async function verifyStatus(req, res, next) {
  try {
    const user = await User.findById(req.payload._id, { status: 1 })
    if (!user) {
      return res.status(401).json({ errorMessage: "User not found" })
    }
    if (user.status === "verified" || user.status === "admin") {
      next()
    } else {
      res.status(403).json({ errorMessage: "Your account is not verified" })
    }
  } catch (error) {
    next(error)
  }
}


async function verifyAdmin(req, res, next) {
  try {
    const user = await User.findById(req.payload._id, { status: 1 })
    if (!user) {
      return res.status(401).json({ errorMessage: "User not found" })
    }
    if (user.status === "admin") {
      next()
    } else {
      res.status(403).json({ errorMessage: "Admin access required" })
    }
  } catch (error) {
    next(error)
  }
}


module.exports = {
  verifyToken,
  verifyStatus,
  verifyAdmin,
}
