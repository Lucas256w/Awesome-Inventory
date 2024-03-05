const Category = require("../models/category");
const Item = require("../models/item");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { validateCategory } = require("./validators/categoryValidator");

// Get request for /, homepage with number of categories and items
exports.homepage = asyncHandler(async (req, res, next) => {
  const [numCategory, numItem] = await Promise.all([
    Category.countDocuments().exec(),
    Item.countDocuments().exec(),
  ]);

  res.render("index", {
    number_of_categories: numCategory,
    number_of_items: numItem,
  });
});

// GET request for /categories, get all categories
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();

  res.render("categories", { categories: allCategories });
});

// Get request for /category/:id, get sepcific category info
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, item] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).populate("category").exec(),
  ]);

  if (category === null) {
    const error = new Error("Category not found");
    return next(error);
  }

  res.render("category_detail", { category: category, item: item });
});

// DELETE request for /category/:id, delete category, press delete button
exports.category_delete = asyncHandler(async (req, res, next) => {
  const [category, item] = await Promise.all([
    Category.findById(req.body.categoryid).exec(),
    Item.find({ category: req.body.categoryid }).populate("category").exec(),
  ]);

  // If there exist items that have the category still, tell user to delete all related items first
  if (item) {
    res.render("category_detail", {
      category: category,
      item: item,
      error: "Please delete all corresponding items before deleting category",
    });
    return;
  }

  await Category.deleteOne({ _id: req.body.categoryid });

  res.redirect(`/inventory/categories`);
});

// GET request for /category/add, render add category form
exports.category_add = asyncHandler(async (req, res, next) => {
  res.render("category_form", {
    title: "Create New Category",
  });
});

// POST request for /category/add, put new category in database
exports.category_add_post = [
  // Validate and sanitize fields
  validateCategory,

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
    category: category,
  });
});

// PUT request for /category/:id/update, update category info
exports.category_update_put = [
  // Validate and sanitize fields
  validateCategory,

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
