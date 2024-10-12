import express from "express";

import categoryRoute from "./admin/category.route.js";
import productRoute from "./admin/product.route.js";
import customerRoute from "./admin/customer.route.js";

const router = express.Router();

router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/customers", customerRoute);

export default router;