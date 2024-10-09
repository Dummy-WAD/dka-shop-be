import express from "express";

import categoryRoute from "./admin/category.route.js";
import productRoute from "./admin/product.route.js";

const router = express.Router();

router.use("/categories", categoryRoute);
router.use("/products", productRoute);

export default router;