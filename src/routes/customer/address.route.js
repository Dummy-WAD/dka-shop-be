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
router.get("/provinces",
    addressController.getAllProvinces
);

router.get("/districts",
    validate(addressValidation.getAllDistrictsInProvince),
    addressController.getAllDistrictsInProvince
);

router.get("/wards",
    validate(addressValidation.getAllWardsInDistrict),
    addressController.getAllWardsInDistrict
);

router.get("/",
    addressController.getCustomerAddresses
);

router.get("/:addrId",
    validate(addressValidation.getAddressDetails),
    addressController.getAddressDetails
);

router.delete("/:addrId",
    validate(addressValidation.getAddressDetails),
    addressController.deleteAddress
);

router.patch("/:addrId",
    validate(addressValidation.getAddressDetails),
    addressController.updateAddressInfo
);

router.patch("/:addrId/set-default",
    validate(addressValidation.getAddressDetails),
    addressController.setDefaultAddress
);

export default router;
