import express from 'express';
import orderController from '../../controllers/order.controller.js';
import orderValidation from '../../validations/order.validation.js';
import validate from '../../middlewares/validate.js';
const router = express.Router();

router.get(
    '/customers/:customerId',
    validate(orderValidation.getOrdersByCustomer),
    orderController.getOrdersByCustomer
  );

export default router;
