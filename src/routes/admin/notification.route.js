import express from "express";
import validate from "../../middlewares/validate.js";
import notificationController from '../../controllers/notification.controller.js';
import notificationValidation from '../../validations/notification.validation.js';

const router = express.Router();

router.get(
    "/",
    validate(notificationValidation.getNotifications),
    notificationController.getNotifications
  );

export default router;
