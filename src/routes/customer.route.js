import express from "express";
import categoryRoute from "./customer/category.route.js";
import productRoute from "./customer/product.route.js";
import personalRoute from "./customer/personal.route.js";
import addressRoute from "./customer/address.route.js";
import cartRoute from "./customer/cart.route.js";
import orderRoute from "./customer/order.route.js";
import notificationRoute from "./customer/notification.route.js";
import deliveryServiceRoute from "./customer/delivery-service.route.js";
import reviewRoute from "./customer/review.route.js";

const router = express.Router();

router.use("/reviews", reviewRoute);
router.use("/orders", orderRoute);
router.use("/carts", cartRoute);
router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/personal", personalRoute);
router.use("/addresses", addressRoute);
router.use("/delivery-services", deliveryServiceRoute);
router.use("/notifications", notificationRoute);

export default router;