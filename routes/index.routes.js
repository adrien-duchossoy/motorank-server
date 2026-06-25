const router = require("express").Router()

// ℹ️ Organize and connect all your route files here.
const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

const userRouter = require("./user.routes")
router.use("/users", userRouter)

const uploadRoutes = require("./upload.routes")
router.use("/upload", uploadRoutes)

//EXAMPLE OF PRIVATE ROUTE
const { verifyToken, verifyStatus } = require("../middlewares/auth.middlewares")
router.get("/example-of-private-route", verifyToken, (req, res) => {
  res.send(
    "This is private info example.You have succesfully accessed a private route",
  )
})

//EXAMPLE OF VERIFIED ACCOUNT ROUTE
router.get(
  "/example-of-verified-route",
  verifyToken,
  verifyStatus,
  (req, res) => {
    // example of admin requests
    // - ban a user
    // - delete/edit any comment or any document diregarding the owner
    // - create products in a e-commerce

    res.send("your accoutn is verified! you can process this request")
  },
)

module.exports = router
