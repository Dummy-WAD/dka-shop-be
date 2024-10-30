import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import personalValidation from "../../validations/personal.validation.js";
import validate from "../../middlewares/validate.js";
import personalController from "../../controllers/personal.controller.js";

const router = express.Router();

// No authentication required


// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer); // check if the user is a customer

// after this line, all routes are protected

router.patch(
    "/profile",
    validate(personalValidation.updateProfile),
    personalController.updateProfile
);

router.patch(
    "/password",
    validate(personalValidation.changePassword),
    personalController.changePassword
);

export default router;
