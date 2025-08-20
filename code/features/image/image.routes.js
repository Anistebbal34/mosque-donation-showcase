const express = require("express");
const router = express.Router();

const {
  uploadImageController,
  checkWeeklyImageUploadController,
  deleteWeeklyImageController,
  getWeeklyImageController,
} = require("./image.controller.js");

const upload = require("../../middleware/multer.js");

// Upload image (with Multer)
router.post("/upload", upload.single("file"), uploadImageController);

// Check if this week’s image was already uploaded
router.get("/check", checkWeeklyImageUploadController);

// Get this week’s image
router.get("/", getWeeklyImageController);

// Delete this week’s image(s)
router.delete("/", deleteWeeklyImageController);

module.exports = router;
