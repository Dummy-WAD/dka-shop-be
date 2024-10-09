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

export default {
  createCategory,
  deleteCategory
};
