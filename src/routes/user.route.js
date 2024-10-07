import express from "express";
import categoryRoute from "./user/category.route.js";
import productRoute from "./user/product.route.js";

const router = express.Router();

router.use("/category", categoryRoute);
router.use("/product", productRoute);

export default router;