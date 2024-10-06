const express = require("express");
const validate = require("../middlewares/validate");
const authController = require("../controllers/auth.controller");
const authValidation = require("../validations/auth.validation");
const categoryValidation = require("../validations/category.validation");
const categoryController = require("../controllers/category.controller");

const router = express.Router();

router.post(
    "/auth/login",
    validate(authValidation.login),
    authController.login
);

router.post(
    "/admin/create-category",
    validate(categoryValidation.createCategory),
    categoryController.createCategory
);

module.exports = router;