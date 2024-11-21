import express from "express";
import passport from "passport"; // Import passport for authentication
import categoryRoute from "./admin/category.route.js";
import productRoute from "./admin/product.route.js";
import customerRoute from "./admin/customer.route.js";
import orderRoute from './admin/order.route.js'
import imageRoute from './admin/image.route.js'
import statisticsRoute from './admin/statistics.route.js'
import discountRoute from './admin/discount.route.js'
import notificationRoute from './admin/notification.route.js'
import { isAdmin } from "../middlewares/authorization.js";

const router = express.Router();
router.use(passport.authenticate("jwt", { session: false })); // Protect all routes
router.use(isAdmin); // check if the user is an admin

router.use("/discounts", discountRoute);
router.use("/statistics", statisticsRoute);
router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/customers", customerRoute);
router.use("/orders", orderRoute);
router.use("/images", imageRoute);
router.use("/notifications", notificationRoute);

export default router;