import express from 'express';
import notificationController from '../../controllers/notification.controller.js';
import notificationValidation from '../../validations/notification.validation.js';
import validate from '../../middlewares/validate.js';
import passport from 'passport';
import { isCustomer } from '../../middlewares/authorization.js';
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.get(
    '/',
    validate(notificationValidation.getNotifications),
    notificationController.getNotifications
  );

export default router;
