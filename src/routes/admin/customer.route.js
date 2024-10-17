import express from "express";
import customerController from "../../controllers/customer.controller.js";
import customerValidation from "../../validations/customer.validation.js";
import validate from "../../middlewares/validate.js";
const router = express.Router();

router.get(
    "/",
    validate(customerValidation.getAllCustomers),
    customerController.getAllCustomers
  );

router.get(
  "/:customerId",
  validate(customerValidation.getCustomerDetail),
  customerController.getCustomerDetail
);

export default router;
