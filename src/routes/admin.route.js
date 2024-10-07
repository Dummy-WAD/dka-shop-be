import express from "express";

import categoryRoute from "./admin/category.route.js";
import productRoute from "./admin/product.route.js";

const router = express.Router();

router.use("/category", categoryRoute);
router.use("/product", productRoute);

export default router;