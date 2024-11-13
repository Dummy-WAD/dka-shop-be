import Joi from 'joi';
import { OrderStatus, OrderType, StatisticsPeriod } from '../utils/enums.js';

const getNewCustomerStatistics = {
    query: Joi.object().keys({
        type: Joi.string().valid(...Object.values(StatisticsPeriod)).required(),
        limit: Joi.number().integer().min(1).max(12).default(4)
    })
};

const getOrderStatistics = {
    query: Joi.object().keys({
        type: Joi.string().valid(...Object.values(StatisticsPeriod)).required(),
        limit: Joi.number().integer().min(1).max(12).default(4)
    })
};

const getProductRevenueStatistics = {
    query: Joi.object().keys({
        orderType: Joi.string().valid(...Object.values(OrderType)).required(),
        limit: Joi.number().integer().min(1).default(5)
    })
};

const getProductSoldStatistics = {
    query: Joi.object().keys({
        orderType: Joi.string().valid(...Object.values(OrderType)).required(),
        limit: Joi.number().integer().min(1).default(5)
    })
};


export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getProductRevenueStatistics,
    getProductSoldStatistics
}