import express from "express";
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false })); 

router.get(
    "/",
    validate(productValidation.getProducts),
    productController.getAllProducts
  );
export default router;
