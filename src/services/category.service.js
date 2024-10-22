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
    const { categoryId } = req.params
    const { name, description } = req.body
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

const getBestSellerProducts = async (filter) => {
    const query = `
        SELECT 
            c.id AS categoryId,
            c.name AS categoryName,
            p.id AS productId,
            p.name AS productName,
            MAX(pi.image_url) AS imageUrl,
            p.price AS productPrice,
            CASE
                WHEN NOW() BETWEEN MAX(do.start_date) AND MAX(do.expiration_date)
                AND MAX(do.discount_type) = 'PRICE' THEN p.price - MAX(do.discount_value)
                WHEN NOW() BETWEEN MAX(do.start_date) AND MAX(do.expiration_date)
                AND MAX(do.discount_type) = 'PERCENTAGE' THEN p.price - (p.price * MAX(do.discount_value) / 100)
                ELSE p.price
            END AS priceDiscounted
        FROM 
            categories AS c
        JOIN 
            products AS p ON c.id = p.category_id AND p.is_deleted = false
        LEFT JOIN 
            product_images AS pi ON p.id = pi.product_id AND pi.is_primary = true
        LEFT JOIN 
            product_variants AS pv ON pv.product_id = p.id AND pv.is_deleted = false
        LEFT JOIN 
            order_items AS oi ON oi.product_variant_id = pv.id
        LEFT JOIN 
            product_discount_offers AS pdo ON p.id = pdo.product_id
        LEFT JOIN 
            discount_offers AS do ON pdo.discount_offer_id = do.id AND do.is_deleted = false
        WHERE 
            c.is_deleted = false
            ${filter?.categoryId ? `AND c.id = ${filter?.categoryId}` : ''}
        GROUP BY 
            c.id, p.id
        ORDER BY 
        ${filter?.categoryId ? '' : `
            (SELECT SUM(oi2.quantity) 
             FROM products p2
             LEFT JOIN product_variants pv2 ON pv2.product_id = p2.id
             LEFT JOIN order_items oi2 ON oi2.product_variant_id = pv2.id
             WHERE p2.category_id = c.id AND p2.is_deleted = false) DESC,
        `}
        (SELECT SUM(oi3.quantity) 
         FROM order_items oi3
         LEFT JOIN product_variants pv3 ON oi3.product_variant_id = pv3.id
         WHERE pv3.product_id = p.id) DESC 
        LIMIT ${filter?.limit};
    `;
    const [results, _metadata] = await db.sequelize.query(query);
    return results;
};

export default {
    createCategory,
    deleteCategory,
    getAllCategories,
    editCategory,
    getBestSellerProducts
}
