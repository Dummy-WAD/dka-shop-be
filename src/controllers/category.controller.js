import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { categoryService } from '../services/index.js';

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId);
  res.status(httpStatus.OK).send({
    message: `Category with id: ${req.params.categoryId} deleted successfully`,
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

export default {
  createCategory,
  deleteCategory,
  getAllCategories,
};
