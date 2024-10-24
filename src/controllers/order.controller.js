import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import orderService from '../services/order.service.js';

const getOrdersByCustomer = catchAsync(async (req, res) => {
  const id = pick(req.params, ['customerId'])
  const options = pick(req.query, ['sortBy', 'order', 'limit', 'page']);
  const orders = await orderService.getOrdersByCustomer({}, options, id);
  res.status(httpStatus.OK).send(orders);
});

export default {
    getOrdersByCustomer
};
