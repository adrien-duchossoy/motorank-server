const router = require("express").Router();

const { verifyToken } = require('../middlewares/auth.middlewares.js');
const uploader = require("../middlewares/cloudinary.config.js");


router.post("/", verifyToken, uploader.single("image"), (req, res, next) => {

  if (!req.file) {
    res.status(400).json({
      errorMessage: "There was a problem uploading the image. Check image format and size."
    })
    return;
  }

  res.json({ imageUrl: req.file.path });
});

module.exports = router;