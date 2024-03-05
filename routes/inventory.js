const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");

// Controller modules
const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

/* Homepage */
router.get("/", function (req, res, next) {
  res.render("index");
});

/// Category routes

// GET request for /categories, display all categories
router.get("/categories", category_controller.category_list);

// GET request for /category/add, render add category form
router.get("/category/add", category_controller.category_add);

// POST request for /category/add, put new category in database
router.post("/category/add", category_controller.category_add_post);

// GET request for /category/:id, display specific category
router.get("/category/:id", category_controller.category_detail);

// DELETE request for /category/:id, delete category, press delete button
router.post("/category/:id", category_controller.category_delete);

// GET request for /category/:id/update, render update category form
router.get("/category/:id/update", category_controller.category_update);

// PUT request for /category/:id/update, update category info
router.post("/category/:id/update", category_controller.category_update_put);

/// Item routes

// GET request for /categories, display all categories
router.get("/items", item_controller.item_list);

// GET request for /category/add, render add category form
router.get("/item/add", item_controller.item_add);

// POST request for /category/add, put new category in database
router.post(
  "/item/add",
  upload.single("uploaded_file"),
  item_controller.item_add_post
);

module.exports = router;
