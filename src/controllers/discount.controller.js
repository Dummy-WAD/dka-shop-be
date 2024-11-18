import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { discountServices } from '../services/index.js';
import pick from '../utils/pick.js';

const getDiscountDetail = catchAsync(async (req, res) => {
  const discount = await discountServices.getDiscountDetail(req.params.discountId);
  res.status(httpStatus.OK).send(discount);
});

const getAllProductsWithDiscount = catchAsync(async (req, res) => {
  const options = pick(req.query, ['limit', 'page']);
  const filter = { id: req.params.discountId };
  const products = await discountServices.getAllProductsWithDiscount(filter, options);
  res.status(httpStatus.OK).send(products);
});

const createDiscount = catchAsync(async (req, res) => {
  const discount = await discountServices.createDiscount(req.body);
  res.status(httpStatus.CREATED).send(discount);
});

const editDiscount = catchAsync(async (req, res) => {
  await discountServices.editDiscount(req.params.discountId, req.body);
  res.status(httpStatus.OK).send({ message: 'Edit discount successfully' });
});

export default {
  getDiscountDetail,
  getAllProductsWithDiscount,
  createDiscount,
  editDiscount
};
