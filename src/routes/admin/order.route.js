import express from 'express';
import orderController from '../../controllers/order.controller.js';
import orderValidation from '../../validations/order.validation.js';
import validate from '../../middlewares/validate.js';
const router = express.Router();

router.get(
  '/',
  validate(orderValidation.getOrdersByAdmin),
  orderController.getOrdersByAdmin
);

router.get(
    '/customers/:customerId',
    validate(orderValidation.getOrdersByCustomer),
    orderController.getOrdersByCustomer
  );

// get order detail by id
router.get(
  '/:orderId',
  validate(orderValidation.getOrderById),
  orderController.getOrderById
);

export default router;
