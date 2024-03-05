const { body } = require("express-validator");

// Shared validation and sanitization for category creation and update
exports.validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name is needed")
    .escape(),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is needed")
    .escape(),
];
