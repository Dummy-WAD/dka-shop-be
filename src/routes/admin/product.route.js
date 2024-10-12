import express from "express";
import passport from "passport"; 
import productController from "../../controllers/product.controller.js";
import productValidation from "../../validations/product.validation.js";
import validate from "../../middlewares/validate.js";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false })); 

router.get(
    "/",
    validate(productValidation.getProducts),
    productController.getAllProducts
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
