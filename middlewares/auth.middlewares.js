const jwt = require("jsonwebtoken")


function verifyToken(req, res, next) {

  console.log(req.headers)

  try {
    const authToken = req.headers.authorization.split(" ")[1]
    const payload = jwt.verify(authToken, process.env.TOKEN_SECRET)
    req.payload = payload
    next()
  } catch (error) {
    res.status(401).json({errorMessage: "Token invalid or doesn't exist"})
  }

}


function verifyStatus(req, res, next) {

  if (req.payload.status === "verified") {
    next()
  } else {
    res.status(401).json({errorMessage: "You are account is not verified"})
  }

}

module.exports = {
  verifyToken, 
  verifyStatus
}