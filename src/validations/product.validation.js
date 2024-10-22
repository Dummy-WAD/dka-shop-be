import Joi from 'joi';

const getProducts = {
    query: Joi.object().keys({
        name: Joi.string().trim().max(30).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        sortBy: Joi.string().valid('name', 'price', 'createdAt', 'updatedAt').optional(),
        order: Joi.string().valid('asc', 'desc').optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

const deleteProduct = {
    params: Joi.object().keys({
        productId: Joi.number().integer().positive().required()
    })
};

const getProductDetail = {
    params: Joi.object().keys({
        productId: Joi.number().integer().positive().required()
    })
};

const getProductsForCustomer = {
    query: Joi.object().keys({
        name: Joi.string().trim().max(30).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        sortBy: Joi.string().valid('price', 'updatedAt').default('updatedAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        priceStart: Joi.number().min(0).optional(),
        priceEnd: Joi.number().min(0).optional(),
    }).custom((value, helpers) => {
        if (value.priceEnd < value.priceStart) {
            return helpers.error('priceEnd must be greater than or equal to priceStart');
        }
        return value;
    })
};

export default {
    getProducts,
    deleteProduct,
    getProductDetail,
    getProductsForCustomer
}