const Category = require("../models/category");
const Item = require("../models/item");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// GET request for /categories, get all categories
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();

  res.render("categories", { categories: allCategories });
});

// Get request for /category/:id, get sepcific category info
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, item] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    const error = new Error("Category not found");
    return next(error);
  }

  res.render("category_detail", { category: category, item: item });
});

// DELETE request for /category/:id, delete category, press delete button
exports.category_delete = asyncHandler(async (req, res, next) => {
  await Item.updateMany(
    { category: req.body.categoryid },
    { $set: { category: null } }
  );

  await Category.deleteOne({ _id: req.body.categoryid });

  res.redirect(`/inventory/categories`);
});

// GET request for /category/add, render add category form
exports.category_add = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Create New Category",
    req_type: "POST",
  });
});

// POST request for /category/add, put new category in database
exports.category_add_post = [
  // Validate and sanitize fields
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

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // If there are errors, load form again wirth err messages
      res.render("category_form", {
        errors: errors.array(),
        category: category,
      });
      return;
    } else {
      // No errors then save the new record
      await category.save();

      res.redirect(category.url);
    }
  }),
];

// GET request for /category/:id/update, render update category form
exports.category_update = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const error = new Error("Category not found");
    return next(error);
  }

  res.render("category_form", {
    title: "Update Category",
    req_type: "PUT",
    category: category,
  });
});

// PUT request for /category/:id/update, update category info
exports.category_update_put = [
  // Validate and sanitize fields
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

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are errors, load form again wirth err messages
      res.render("category_form", { errors: errors.array() });
      return;
    } else {
      // No errors then update the category
      await Category.updateOne(
        { _id: req.params.id },
        { $set: { name: req.body.name, description: req.body.description } }
      );

      res.redirect(`/inventory/category/${req.params.id}`);
    }
  }),
];
