import express from "express";
import categoryRoute from "./customer/category.route.js";
import productRoute from "./customer/product.route.js";
import customerRoute from "./customer/customer.route.js";

const router = express.Router();

router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/", customerRoute);

export default router;