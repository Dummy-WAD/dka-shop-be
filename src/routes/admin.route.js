import express from "express";
import passport from "passport"; // Import passport for authentication
import categoryRoute from "./admin/category.route.js";
import productRoute from "./admin/product.route.js";
import customerRoute from "./admin/customer.route.js";
import { isTokenValid, isTokenExpired, isAdmin } from "../middlewares/authorization.js";

const router = express.Router();
router.use(passport.authenticate("jwt", { session: false })); // Protect all routes
router.use(isTokenValid); // check if the token is valid
router.use(isTokenExpired); // check if the token is expired
router.use(isAdmin); // check if the user is an admin

router.use("/categories", categoryRoute);
router.use("/products", productRoute);
router.use("/customers", customerRoute);

export default router;