import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { categoryService } from '../services/index.js';
import pick from '../utils/pick.js';

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  res.status(httpStatus.OK).send({
    message: `Category deleted successfully`,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const { page, limit, sortBy, name, order } = req.query;
  const filter = {
    is_deleted: 0
  };
  if (name) {
    filter.name = name;
  }
  const options = {
    page,
    limit,
    sortBy,
    order
  }
  const categories = await categoryService.getAllCategories(filter, options);
  res.status(httpStatus.OK).send(categories);
});

const editCategory = catchAsync(async (req, res) => {
  await categoryService.editCategory(req);
  res.status(httpStatus.OK).send({
    message: `Category updated successfully`,
  });
});

const getBestSellerProducts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['categoryId', 'limit']);
  const bestSellerProducts = await categoryService.getBestSellerProducts(filter);
  res.status(httpStatus.OK).send(bestSellerProducts);
});

export default {
  createCategory,
  deleteCategory,
  getAllCategories,
  editCategory,
  getBestSellerProducts
};
