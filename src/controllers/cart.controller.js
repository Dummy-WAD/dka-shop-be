import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { cartServices } from '../services/index.js';
import pick from '../utils/pick.js';

const getAllCartItems = catchAsync(async (req, res) => {
  const filter = pick(req.user.dataValues, ['id']);
  const options = pick(req.query, ['limit', 'page']);
  const cartItems = await cartServices.getAllCartItems({ ...filter, productVariantId: req.query.productVariantId }, options);
  res.status(httpStatus.OK).send(cartItems);
});

const addProductToCart = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  const totalCartItems = await cartServices.addProductToCart(userReq.id, req.body);
  res.status(httpStatus.OK).send(totalCartItems);
});

const editCartItemQuantity = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  await cartServices.editCartItemQuantity(userReq.id, req.body);
  res.status(httpStatus.OK).send({ message: 'The quantity of this product variant updated successfully'});
});

const removeProductFromCart = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  const totalCartItems = await cartServices.removeProductFromCart(userReq.id, req.body.productVariantId);
  res.status(httpStatus.OK).send(totalCartItems);
});

const getTotalCartItemQuantity = catchAsync(async (req, res) => {
  const userReq = pick(req.user.dataValues, ['id']);
  const totalCartItems = await cartServices.getTotalCartItemQuantity(userReq.id);
  res.status(httpStatus.OK).send({ totalCartItems });
});

export default {
  getAllCartItems,
  addProductToCart,
  editCartItemQuantity,
  removeProductFromCart,
  getTotalCartItemQuantity
};
