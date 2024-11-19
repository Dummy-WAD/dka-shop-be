import express from "express";
import validate from "../../middlewares/validate.js";
import { discountValidation } from "../../validations/index.js";
import discountController from "../../controllers/discount.controller.js";

const router = express.Router();

router.get(
  "/:discountId",
  validate(discountValidation.getDiscountDetail),
  discountController.getDiscountDetail
);

router.get(
  "/products/:discountId",
  validate(discountValidation.getDiscountDetail),
  discountController.getAllProductsWithDiscount
);

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

router.post(
    "/:discountId/apply",
    validate(discountValidation.applyDiscount),
    discountController.applyDiscount
);

router.delete(
  "/:discountId",
  validate(discountValidation.deleteDiscount),
  discountController.deleteDiscount
);

export default router;
