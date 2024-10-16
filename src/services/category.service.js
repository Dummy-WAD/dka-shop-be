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

const editCategory = async (req) => {
    const {categoryId} = req.params
    const {name, description} = req.body
    const currentCategory = await db.category.findOne({ where: { id: categoryId, is_deleted: false } });
    if (!currentCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category does not exist");
    }
    if (name !== undefined) {
        const trimmedName = name.trim();
        if (trimmedName !== currentCategory.name) {
            const existingCategory = await db.category.findOne({
                where: {
                    name: trimmedName,
                    is_deleted: false
                }
            });

            if (existingCategory) {
                throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "This category already taken");
            }
        }
    }
    await db.category.update(
        { 
            name: name !== undefined ? name.trim() : currentCategory.name,
            description: description !== undefined ? description.trim() : currentCategory.description
        },
        { 
            where: { id: categoryId } 
        }
    );
};


export default { 
    createCategory, 
    deleteCategory,
    getAllCategories,
    editCategory
}
