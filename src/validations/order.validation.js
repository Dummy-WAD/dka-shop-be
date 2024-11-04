import Joi from 'joi';
import { OrderStatus } from '../utils/enums.js';

const getOrdersByCustomer = {
    params: Joi.object().keys({
        customerId: Joi.number().integer().positive().required()
    }),
    query: Joi.object().keys({
        sortBy: Joi.string().valid('updatedAt').default('updatedAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(5)
    })
};

const getMyOrders = {
    query: Joi.object().keys({
        status: Joi.string().valid(...Object.values(OrderStatus)),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(5)
    })
};

export default {
    getOrdersByCustomer,
    getMyOrders
}
