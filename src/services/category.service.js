import httpStatus from 'http-status';
import db from "../models/index.js";
import ApiError from '../utils/ApiError.js';

const { Category } = db;

const createCategory = async (categoryPayload) => {
    const category = await Category.findOne({
        where: {
            name: categoryPayload.name,
        }
    });
    if (!!category) throw new ApiError(httpStatus.BAD_REQUEST, "This category already taken");
    return Category.create(categoryPayload);
};

export default { createCategory }