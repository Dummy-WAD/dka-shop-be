import express from "express";
import passport from "passport"; // Import passport for authentication
import { isCustomer } from "../../middlewares/authorization.js";

const router = express.Router();

// No authentication required


// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer); // check if the user is a customer

// after this line, all routes are protected

export default router;
