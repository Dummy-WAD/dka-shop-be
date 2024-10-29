import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import cartController from "../../controllers/cart.controller.js";
import validate from "../../middlewares/validate.js";
import cartValidation from "../../validations/cart.validation.js";

const router = express.Router();

// No authentication required

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.get('/', 
    validate(cartValidation.getAllCartItems),
    cartController.getAllCartItems
);

export default router;
