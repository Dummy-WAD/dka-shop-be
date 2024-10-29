import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import addressController from "../../controllers/address.controller.js";
import validate from "../../middlewares/validate.js";
import addressValidation from "../../validations/address.validation.js";

const router = express.Router();

// No authentication required


// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer); // check if the user is a customer

// after this line, all routes are protected
router.get("/",
    addressController.getCustomerAddresses
);

router.delete("/:addrId",
    validate(addressValidation.deleteAddress),
    addressController.deleteAddress
);

export default router;
