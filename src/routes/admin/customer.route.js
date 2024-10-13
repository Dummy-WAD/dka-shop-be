import express from "express";
import passport from "passport"; 
import customerController from "../../controllers/customer.controller.js";
import customerValidation from "../../validations/customer.validation.js";
import validate from "../../middlewares/validate.js";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false })); 

router.get(
    "/",
    validate(customerValidation.getAllCustomers),
    customerController.getAllCustomers
  );

export default router;
