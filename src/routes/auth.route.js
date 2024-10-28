import express from "express";
import validate from "../middlewares/validate.js";
import authController from "../controllers/auth.controller.js";
import { authValidation } from "../validations/index.js";

import passport from "passport";

const router = express.Router();

// No authentication required
router.post(
  "/sign-up", 
  validate(authValidation.register), 
  authController.register
);

router.post(
  "/login",
  validate(authValidation.login),
  authController.login
);

router.get(
  "/confirm-sign-up",
  authController.confirmRegister
);

router.post(
  "/resend-confirmation-email",
  validate(authValidation.resendConfirmationEmail),
  authController.resendConfirmationEmail
)

router.post(
  "/refresh-token",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));

router.get(
  "/current-user",
  authController.getCurrentUser
);

router.post(
  "/logout",
  validate(authValidation.logout),
  authController.logout
);

router.patch(
  "/profile",
  validate(authValidation.updateProfile),
  authController.updateProfile
);

export default router;