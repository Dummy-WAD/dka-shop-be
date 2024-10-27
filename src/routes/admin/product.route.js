import express from "express";
import productController from "../../controllers/product.controller.js";
import productValidation from "../../validations/product.validation.js";
import validate from "../../middlewares/validate.js";
const router = express.Router();

router.get(
    "/",
    validate(productValidation.getProducts),
    productController.getAllProducts
  );

router.post(
    "/",
    validate(productValidation.createProduct),
    productController.createProduct
);

router.put(
    "/:productId",
    validate(productValidation.updateProduct),
    productController.updateProduct
  );

router.delete(
    "/:productId",
    validate(productValidation.deleteProduct),
    productController.deleteProduct
  );

router.get(
    "/:productId",
    validate(productValidation.getProductDetail),
    productController.getProductDetail
  );
  
export default router;
