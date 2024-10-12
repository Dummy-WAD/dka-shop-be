import express from "express";
import customerController from "../../controllers/customer.controller.js";
import passport from "passport";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false })); 

router.get(
    "/",
    customerController.getCustomerInfo
  );

export default router;
