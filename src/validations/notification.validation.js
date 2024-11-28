import Joi from 'joi';

const getNotifications = {
    query: Joi.object().keys({
        limit: Joi.number().integer().min(1).max(100).default(10),
        after: Joi.date().iso().optional(),
    })
};

export default {
    getNotifications
}
