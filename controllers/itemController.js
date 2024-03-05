const Category = require("../models/category");
const Item = require("../models/item");
const { validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { validateItem } = require("./validators/itemValidator");

const cloudinary = require("../config/cloudinaryConfig");

// GET request for /items, get all items
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find().exec();

  res.render("items", { items: allItems });
});

// Get request for /item/:id, get sepcific item info
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    const error = new Error("Item not found");
    return next(error);
  }

  res.render("item_detail", { item: item });
});

// DELETE request for /item/:id, delete item, press delete button
exports.item_delete = asyncHandler(async (req, res, next) => {
  await Item.deleteOne({ _id: req.body.itemid });

  res.redirect(`/inventory/items`);
});

// GET request for /item/add, render add item form
exports.item_add = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();

  res.render("item_form", {
    title: "Create New Item",
    categories: allCategories,
  });
});

// POST request for /item/add, put new item in database
exports.item_add_post = [
  // Validate and sanitize fields
  validateItem,

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Item object with escaped and trimmed data
    let item;

    // If theres a picture
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);

      item = new Item({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        profile_img: result.secure_url,
        cloudinary_id: result.public_id,
        price: req.body.price,
        number_in_stock: req.body.number_in_stock,
      });
    } else {
      item = new Item({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        number_in_stock: req.body.number_in_stock,
      });
    }

    if (!errors.isEmpty()) {
      // If there are errors, load form again wirth err messages
      res.render("item_form", {
        errors: errors.array(),
        item: item,
      });
      return;
    } else {
      // No errors then save the new record
      await item.save();

      res.redirect(item.url);
    }
  }),
];

// GET request for /item/:id/update, render update item form
exports.item_update = asyncHandler(async (req, res, next) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().exec(),
  ]);

  if (item === null) {
    const error = new Error("Item not found");
    return next(error);
  }

  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: allCategories,
  });
});

// PUT request for /item/:id/update, update item info
exports.item_update_put = [
  // Validate and sanitize fields
  validateItem,

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // If there are errors, load form again wirth err messages
      res.render("item_form", { errors: errors.array() });
      return;
    } else {
      // No errors then update the item

      // If theres a picture
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);

        await Item.updateOne(
          { _id: req.params.id },
          {
            $set: {
              name: req.body.name,
              description: req.body.description,
              category: req.body.category,
              profile_img: result.secure_url,
              cloudinary_id: result.public_id,
              price: req.body.price,
              number_in_stock: req.body.number_in_stock,
            },
          }
        );
      } else {
        // If theres no picture
        await Item.updateOne(
          { _id: req.params.id },
          {
            $set: {
              name: req.body.name,
              description: req.body.description,
              category: req.body.category,
              price: req.body.price,
              number_in_stock: req.body.number_in_stock,
            },
          }
        );
      }

      res.redirect(`/inventory/item/${req.params.id}`);
    }
  }),
];
