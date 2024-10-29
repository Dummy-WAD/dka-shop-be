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

const addProductToCart = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  const totalCartItems = await cartServices.addProductToCart(userReq.id, req.body);
  res.status(httpStatus.OK).send(totalCartItems);
});

const removeProductFromCart = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  const totalCartItems =await cartServices.removeProductFromCart(userReq.id, req.body.productVariantId);
  res.status(httpStatus.OK).send(totalCartItems);
});

export default {
  getAllCartItems,
  addProductToCart,
  removeProductFromCart
};
