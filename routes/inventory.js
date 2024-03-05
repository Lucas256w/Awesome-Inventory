const express = require("express");
const router = express.Router();

// Render homepage
router.get("/", function (req, res, next) {
  res.render("index");
});

/// Category paths

module.exports = router;
