import httpStatus from 'http-status';
import db from "../models/models/index.js";
import ApiError from '../utils/ApiError.js';
import paginate from './plugins/paginate.plugin.js';


const createCategory = async (categoryPayload) => {
    const category = await db.category.findOne({
        where: {
            name: categoryPayload.name,
            is_deleted: false
        }
    });

    // console.log(category);
    // check category is null
    if (!!category) throw new ApiError(httpStatus.BAD_REQUEST, "This category already taken");
    return db.category.create(categoryPayload);
};


const deleteCategory = async (categoryId) => {
    const category = await db.category.findByPk(categoryId);
    if (!category) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    if (category.is_deleted) throw new ApiError(httpStatus.BAD_REQUEST, "Category already deleted");
    // change isDeleted to true
    category.is_deleted = true;
    await category.save();
    // await category.destroy();
}

const getAllCategories = async (filter, options) => {
    const categories = await paginate(db.category, filter, options);
    return categories;
}

export default { 
    createCategory, 
    deleteCategory,
    getAllCategories
}
