import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import cartController from "../../controllers/cart.controller.js";
import validate from "../../middlewares/validate.js";
import { cartValidation } from "../../validations/index.js";

const router = express.Router();

// No authentication required

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.get('/', 
    validate(cartValidation.getAllCartItems),
    cartController.getAllCartItems
);

router.get('/count', 
    cartController.getTotalCartItemQuantity
);

router.post('/', 
    validate(cartValidation.addProductToCart),
    cartController.addProductToCart
);

router.patch('/', 
    validate(cartValidation.editCartItemQuantity),
    cartController.editCartItemQuantity
);

router.delete('/', 
    validate(cartValidation.removeProductFromCart),
    cartController.removeProductFromCart
);

export default router;
