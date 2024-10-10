import express from "express";
import passport from "passport"; 
import validate from "../../middlewares/validate.js";
import { categoryValidation } from "../../validations/index.js";
import categoryController from "../../controllers/category.controller.js";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false })); // Protect all routes

router.post(
    "/",
    validate(categoryValidation.createCategory),
    categoryController.createCategory
  );

router.delete(
    "/:categoryId",
    categoryController.deleteCategory
  );
  
router.get('/', categoryController.getAllCategories)

export default router;
