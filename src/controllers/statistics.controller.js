import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { statisticsServices } from '../services/index.js';

const getNewCustomerStatistics = catchAsync(async (req, res) => {
    const { type, limit } = req.query;
    const numberOfNewCustomers = await statisticsServices.getNewCustomerStatistics(type, limit);
    res.status(httpStatus.OK).send(numberOfNewCustomers);
});

const getOrderStatistics = catchAsync(async (req, res) => {
    const { type, limit } = req.query;
    const numberOfOrders = await statisticsServices.getOrderStatistics(type, limit);
    res.status(httpStatus.OK).send(numberOfOrders);
});

const getRevenueStatistics = catchAsync(async (req, res) => {
    const { type, limit } = req.query;
    const revenue = await statisticsServices.getRevenueStatistics(type, limit);
    res.status(httpStatus.OK).send(revenue);
});

export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getRevenueStatistics
};