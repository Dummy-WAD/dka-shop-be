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

    // console.log(category);
    // check category is null
    if (!!category) throw new ApiError(httpStatus.BAD_REQUEST, "This category already taken");
    return Category.create(categoryPayload);
};


const deleteCategory = async (categoryId) => {
    const category = await Category.findByPk(categoryId);
    if (!category) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    // change isDeleted to true
    category.is_deleted = true;
    await category.save();
    // await category.destroy();
}

export default { 
    createCategory, 
    deleteCategory
}