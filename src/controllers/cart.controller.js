import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { cartServices } from '../services/index.js';
import pick from '../utils/pick.js';

const getAllCartItems = catchAsync(async (req, res) => {
  const filter = pick(req.user.dataValues, ['id']);
  const options = pick(req.query, ['limit', 'page']);
  const cartItems = await cartServices.getAllCartItems(filter, options);
  res.status(httpStatus.OK).send(cartItems);
});

export default {
  getAllCartItems,
};
