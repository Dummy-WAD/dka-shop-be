
import express from "express";
import passport from "passport";
import validate from "../../middlewares/validate.js";
import productController from "../../controllers/product.controller.js";
import productValidation from "../../validations/product.validation.js";


const router = express.Router();

router.get(
    "/:productId",
    validate(productValidation.getProductDetail),
    productController.getProductDetailForCustomer
);

router.use(passport.authenticate("jwt", { session: false }));

export default router;
