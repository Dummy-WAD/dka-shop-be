import express from 'express';
import orderController from '../../controllers/order.controller.js';
import orderValidation from '../../validations/order.validation.js';
import validate from '../../middlewares/validate.js';
import passport from 'passport';
import { isCustomer } from '../../middlewares/authorization.js';
const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.get(
    '/',
    validate(orderValidation.getMyOrders),
    orderController.getMyOrders
  );

// get order detail by id
router.get(
  '/:orderId',
  validate(orderValidation.getCustomerOrderById),
  orderController.getCustomerOrderById
);

router.post(
    '/prepare',
    validate(orderValidation.prepareOrder),
    orderController.prepareOrder
  );

router.post(
    '/',
    validate(orderValidation.placeOrder),
    orderController.placeOrder
  );

export default router;
