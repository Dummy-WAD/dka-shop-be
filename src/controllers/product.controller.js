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

const getProductDetail = catchAsync(async (req, res) => {
  const products = await productServices.getProductDetail(req.params.productId);
  res.status(httpStatus.OK).send(products);
});

const getProductDetailForCustomer = catchAsync(async (req, res) => {
  const product = await productServices.getProductDetailForCustomer(req.params.productId);
  res.status(httpStatus.OK).send(product);
});

const getProductsForCustomer = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['categoryId', 'priceStart', 'priceEnd']);
  const search = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'order', 'limit', 'page']);
  const products = await productServices.getProductsForCustomer(filter, search, options);
  res.status(httpStatus.OK).send(products);
});

const createProduct = catchAsync(async (req, res) => {
  await productServices.createProduct(req.body);
  res.status(httpStatus.CREATED).send({"success": true, "message": "Product created successfully"});
});

const updateProduct = catchAsync(async (req, res) => {
  await productServices.updateProduct(req.params.productId, req.body);
  res.status(httpStatus.OK).send({"success": true, "message": "Product updated successfully"});
});

export default {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetail,
  getProductDetailForCustomer,
  getProductsForCustomer
};