import express from "express";
import validate from "../../middlewares/validate.js";
import { discountValidation } from "../../validations/index.js";
import discountController from "../../controllers/discount.controller.js";

const router = express.Router();

router.post(
  "/",
  validate(discountValidation.createDiscount),
  discountController.createDiscount
);

router.patch(
  "/:discountId",
  validate(discountValidation.editDiscount),
  discountController.editDiscount
);

export default router;