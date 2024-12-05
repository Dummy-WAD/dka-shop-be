import Joi from 'joi';

const createNewReview = {
    body: Joi.object().keys({
        orderItemId: Joi.number().integer().positive().required(),
        rating: Joi.number().integer().positive().min(1).max(5).required(),
        reviewText: Joi.string().trim().max(255).optional(),
    }),
};

const getReviewsByProduct = {
    params: Joi.object().keys({
        productId: Joi.number().integer().positive().required()
    }),
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(5),
        rating: Joi.number().integer().min(1).max(5).optional()
    })
};

export default {
    createNewReview,
    getReviewsByProduct
}