import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { productServices } from '../services/index.js';
import pick from '../utils/pick.js';

const getAllProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'category_id']);
  const options = pick(req.query, ['sortBy','order', 'limit', 'page']);
  const products = await productServices.getAllProductsByCondition({...filter, is_deleted: false}, options);
  res.status(httpStatus.OK).send(products);
});

export default {
  getAllProducts,
};