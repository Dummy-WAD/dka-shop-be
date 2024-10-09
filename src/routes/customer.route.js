import express from "express";
import categoryRoute from "./customer/category.route.js";
import productRoute from "./customer/product.route.js";

const router = express.Router();

router.use("/categories", categoryRoute);
router.use("/products", productRoute);

export default router;