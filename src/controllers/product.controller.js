import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { productServices } from '../services/index.js';
import pick from '../utils/pick.js';

const getAllProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'categoryId']);
  const options = pick(req.query, ['sortBy','order', 'limit', 'page']);
  const products = await productServices.getAllProductsByCondition({...filter, isDeleted: false}, options);
  res.status(httpStatus.OK).send(products);
});

const deleteProduct = catchAsync(async (req, res) => {
  await productServices.deleteProduct(req.params.productId);
  res.status(httpStatus.OK).send({
    message: `This product deleted successfully`,
  });
});
export default {
  getAllProducts,
  deleteProduct
};