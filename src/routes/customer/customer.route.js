import express from "express";
import customerController from "../../controllers/customer.controller.js";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";

const router = express.Router();

// No authentication required


// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer); // check if the user is a customer

// after this line, all routes are protected

router.get(
    "/",
    customerController.getCustomerInfo
  );

export default router;
