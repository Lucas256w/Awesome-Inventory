const { body } = require("express-validator");

// Shared validation and sanitization for item creation and update
exports.validateItem = [
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
  body("price")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .customSanitizer((value) => Math.round(value * 100) / 100),
  body("number_in_stock")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Number in stock must be a non-negative integer")
    .toInt(),
];
