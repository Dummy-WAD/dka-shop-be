import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import { customerServices } from '../services/index.js';
  
const getCustomerInfo = catchAsync(async (req, res) => {
  const userInfo = pick(req.user.dataValues, ['id', 'email', 'firstName', 'lastName', 'role', 'status']);
  res.status(httpStatus.OK).send(userInfo);
});

const getAllCustomers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['keyword', 'status']);
  const options = pick(req.query, ['sortBy','order', 'limit', 'page']);
  const customers = await customerServices.getAllCustomers(filter, options);
  res.status(httpStatus.OK).send(customers);
});

export default {
    getCustomerInfo,
    getAllCustomers
};