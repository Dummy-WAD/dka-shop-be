import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { categoryService } from '../services/index.js';

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

export default {
  createCategory,
};
