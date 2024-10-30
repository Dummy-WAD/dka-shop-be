import Joi from 'joi';

const getProducts = {
    query: Joi.object().keys({
        name: Joi.string().trim().allow('').max(100).optional(),
        categoryId: Joi.number().integer().positive().optional(),
        sortBy: Joi.string().valid('name', 'price', 'createdAt', 'updatedAt').optional(),
        order: Joi.string().valid('asc', 'desc').optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    })
};

const createProduct = {
    body: Joi.object().keys({
        name: Joi.string().trim().max(100).required(),
        price: Joi.number().precision(2).positive().required(),
        categoryId: Joi.number().integer().positive().required(),  
        description: Joi.string().trim().max(1000).optional(),
        productImages: Joi.array().items(
            Joi.object({
                filename: Joi.string().trim().max(255).required(),
                isPrimary: Joi.boolean().required()
            })
        ).min(1).required().custom((value, helpers) => {
            const primaryCount = value.filter(image => image.isPrimary).length;
            if (primaryCount !== 1) {
                return helpers.message('One and only one image must have isPrimary set to true');
            }
            return value;
        }),
        productVariants: Joi.array().items(Joi.object({
            size: Joi.string().trim().max(10).required(),
            color: Joi.string().trim().max(20).required(),
            quantity: Joi.number().integer().positive().required()
        })).optional().custom((value, helpers) => {
            // check the uniqueness of size and color in lower case
            const uniqueVariants = new Set();
            for (const variant of value) {
                const key = `${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`;
                if (uniqueVariants.has(key)) {
                    return helpers.message('Size and color combination must be unique');
                }
                uniqueVariants.add(key);
            }  
            return value;
        })
    })
};

const updateProduct = {
    params: Joi.object().keys({
        productId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        name: Joi.string().trim().max(100).optional(),
        price: Joi.number().precision(2).positive().optional(),
        categoryId: Joi.number().integer().positive().optional(),
        description: Joi.string().trim().max(1000).optional(),
        productImages: Joi.array().items(
            Joi.object({
                filename: Joi.string().trim().max(255).required(),
                isPrimary: Joi.boolean().required()
            })
        ).min(1).required().custom((value, helpers) => {
            const primaryCount = value.filter(image => image.isPrimary).length;
            if (primaryCount !== 1) {
                return helpers.message('One and only one image must have isPrimary set to true');
            }
            return value;
        }),
        productVariants: Joi.array().items(Joi.object({
            size: Joi.string().trim().max(10).required(),
            color: Joi.string().trim().max(20).required(),
            quantity: Joi.number().integer().required()
        })).min(1).required().custom((value, helpers) => {

            // check quantity is positive
            for (const variant of value) {
                if (variant.quantity < 0) {
                    return helpers.message('Quantity must be positive');
                }
            }

            // check the uniqueness of size and color in lower case
            const uniqueVariants = new Set();
            for (const variant of value) {
                const key = `${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`;
                if (uniqueVariants.has(key)) {
                    return helpers.message('Size and color combination must be unique');
                }
                uniqueVariants.add(key);
            }  
            return value;
        }) 
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
        name: Joi.string().trim().allow('').max(100).optional(),
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

const getBestSellerProducts = {
    query: Joi.object().keys({
        categoryId: Joi.number().integer().positive().optional(),
        limit: Joi.number().integer().positive().optional().default(16)
    })
};

export default {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetail,
    getProductsForCustomer,
    getBestSellerProducts
}