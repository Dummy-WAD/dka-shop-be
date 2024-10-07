import express from "express";
import validate from "../middlewares/validate.js";
import passport from "passport"; 
import authController from "../controllers/auth.controller.js";
import authValidation from "../validations/auth.validation.js";
import categoryValidation from "../validations/category.validation.js";
import categoryController from "../controllers/category.controller.js";

const router = express.Router();

// No authentication required
router.post(
  "/auth/login",
  validate(authValidation.login),
  authController.login
);

router.post(
  "/auth/logout",
  validate(authValidation.logout),
  authController.logout
);

router.post(
  "/auth/refresh-token",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

router.use(passport.authenticate('jwt', { session: false }));

router.post(
  "/admin/create-category",
  validate(categoryValidation.createCategory),
  categoryController.createCategory
);

export default router;