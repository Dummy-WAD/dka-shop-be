import express from "express";
import passport from "passport"; // Import passport
import validate from "../../middlewares/validate.js";
import categoryValidation from "../../validations/category.validation.js";
import categoryController from "../../controllers/category.controller.js";
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));
router.post(
    "/create",
    validate(categoryValidation.createCategory),
    categoryController.createCategory
  );

export default router;
