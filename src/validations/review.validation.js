import Joi from 'joi';

const createNewReview = {
    body: Joi.object().keys({
        orderItemId: Joi.number().integer().positive().required(),
        rating: Joi.number().integer().positive().min(1).max(5).required(),
        reviewText: Joi.string().trim().max(255).optional(),
    }),
};

export default {
    createNewReview
}