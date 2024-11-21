import Joi from 'joi';

const getNotifications = {
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    })
};

export default {
    getNotifications
}
