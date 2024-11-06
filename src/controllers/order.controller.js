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

const getOrdersByAdmin = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['keyword', 'status']);
  const options = pick(req.query, ['sortBy', 'order', 'limit', 'page']);
  const orders = await orderService.getOrdersByAdmin(filter, options);
  res.status(httpStatus.OK).send(orders);
});

const getMyOrders = catchAsync(async (req, res) => {
  const filter = pick(req.user.dataValues, ['id']);
  const options = pick(req.query, ['limit', 'page']);
  const orders = await orderService.getMyOrders({ ...filter, status: req.query.status }, options);
  res.status(httpStatus.OK).send(orders);
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  res.status(httpStatus.OK).send(order);
});

const getCustomerOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getCustomerOrderById(req.params.orderId, req.user.dataValues.id);
  res.status(httpStatus.OK).send(order);
});

export default {
    getOrdersByCustomer,
    getOrdersByAdmin,
    getMyOrders,
    getOrderById,
    getCustomerOrderById
};
