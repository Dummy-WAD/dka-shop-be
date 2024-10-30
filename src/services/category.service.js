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

    const products = await db.product.findOne({ where : { category_id: categoryId } });
    if (products) throw new ApiError(httpStatus.BAD_REQUEST, "Category has products");

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

const getAllCategoriesForCustomer = async () => {
    return await db.category.findAll({ 
        where: { 
            is_deleted: false 
        },
        attributes: ['id', 'name']
    });
};

const editCategory = async (req) => {
    const {categoryId} = req.params
    const {name, description} = req.body
    const currentCategory = await db.category.findOne({ where: { id: categoryId, is_deleted: false } });
    if (!currentCategory) {
        throw new ApiError(httpStatus.NOT_FOUND, "Category does not exist");
    };
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
    };
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

async function getBestSellerCategories(limit) {
    const topCategories = await db.category.findAll({
        attributes: ['id','name'],
        where: { is_deleted: false },
        order: [[db.sequelize.literal(`
            (SELECT COALESCE(SUM(order_items.quantity), 0) 
             FROM order_items 
             JOIN product_variants ON order_items.product_variant_id = product_variants.id 
             JOIN products ON product_variants.product_id = products.id 
             WHERE products.category_id = category.id)
        `), 'DESC']],
        limit: limit
    });

    return topCategories;
}


export default { 
    createCategory, 
    deleteCategory,
    getAllCategories,
    getAllCategoriesForCustomer,
    editCategory,
    getBestSellerCategories
}
