import express from "express";
import validate from "../../middlewares/validate.js";
import categoryValidation from "../../validations/category.validation.js";
import categoryController from "../../controllers/category.controller.js";
const router = express.Router();

router.post(
    "/create",
    validate(categoryValidation.createCategory),
    categoryController.createCategory
  );

export default router;
