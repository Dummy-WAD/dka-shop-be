import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { discountServices } from '../services/index.js';

const createDiscount = catchAsync(async (req, res) => {
  const discount = await discountServices.createDiscount(req.body);
  res.status(httpStatus.CREATED).send(discount);
});

const editDiscount = catchAsync(async (req, res) => {
  await discountServices.editDiscount(req.params.discountId, req.body);
  res.status(httpStatus.OK).send({ message: 'Edit discount successfully' });
});

const applyDiscount = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const { productIds, isConfirmed } = req.body;
  await discountServices.applyDiscount(discountId, productIds, isConfirmed);
  res.status(httpStatus.OK).send("Discount applied successfully");
});

export default {
  createDiscount,
  editDiscount,
  applyDiscount
};
