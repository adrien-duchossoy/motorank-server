const router = require("express").Router()

// ℹ️ Organize and connect all your route files here.
const authRouter = require("./auth.routes")
router.use("/auth", authRouter)

const userRouter = require("./user.routes")
router.use("/users", userRouter)

const uploadRoutes = require("./upload.routes")
router.use("/upload", uploadRoutes)

const motoRoutes = require("./moto.routes")
router.use("/motos", motoRoutes)

const motoAdminRoutes = require("./moto.admin.routes")
router.use("/admin/motos", motoAdminRoutes)

const garageRoutes = require("./garage.routes")
router.use("/garage", garageRoutes)

const reviewRoutes = require("./review.routes")
router.use("/reviews", reviewRoutes)

const eventRoutes = require("./event.routes")
router.use("/events", eventRoutes)

const eventCommentRoutes = require("./eventComment.routes")
router.use("/event-comments", eventCommentRoutes)

module.exports = router
