import express from "express";
import validate from "../middlewares/validate.js";
import passport from "passport"; 
import authController from "../controllers/auth.controller.js";
import authValidation from "../validations/auth.validation.js";

const router = express.Router();

// No authentication required
router.post(
  "/login",
  validate(authValidation.login),
  authController.login
);

router.post(
  "/logout",
  validate(authValidation.logout),
  authController.logout
);

router.post(
  "/refresh-token",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

router.use(passport.authenticate('jwt', { session: false }));

export default router;