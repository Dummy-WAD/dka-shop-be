import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import deliveryServiceController from "../../controllers/delivery-service.controller.js";

const router = express.Router();
// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.get("/", deliveryServiceController.getAllDeliveryServicesForCustomer)

export default router;
