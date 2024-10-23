import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import categoryController from "../../controllers/category.controller.js";
import validate from "../../middlewares/validate.js";
import categoryValidation from "../../validations/category.validation.js";

const router = express.Router();

// No authentication required
router.get(
    "/best-seller",
    validate(categoryValidation.getBestSellerCategories),
    categoryController.getBestSellerCategories
);

router.get('/', categoryController.getAllCategoriesForCustomer)

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer); // check if the user is a customer

// after this line, all routes are protected

export default router;
