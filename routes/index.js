var express = require("express");
var router = express.Router();

/* Redirect to inventory url */
router.get("/", function (req, res, next) {
  res.redirect("/inventory");
});

module.exports = router;
