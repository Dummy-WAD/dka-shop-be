import express from "express";
import categoryRoute from "./customer/category.route.js";
import productRoute from "./customer/product.route.js";
import personalRoute from "./customer/personal.route.js";
import addressRoute from "./customer/address.route.js";

const router = express.Router();

router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/personal", personalRoute);
router.use("/addresses", addressRoute);

export default router;