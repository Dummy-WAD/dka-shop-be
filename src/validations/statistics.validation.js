import Joi from 'joi';
import { OrderStatus, StatisticsPeriod } from '../utils/enums.js';

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

export default {
    getNewCustomerStatistics,
    getOrderStatistics
}