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

const getProductRevenueStatistics = catchAsync(async (req, res) => {
    const { orderType, limit } = req.query;
    const productRevenue = await statisticsServices.getProductRevenueStatistics(orderType, limit);
    res.status(httpStatus.OK).send(productRevenue);
});

const getProductSoldStatistics = catchAsync(async (req, res) => {
    const { orderType, limit } = req.query;
    const productSold = await statisticsServices.getProductSoldStatistics(orderType, limit);
    res.status(httpStatus.OK).send(productSold);
});

const getRevenueStatistics = catchAsync(async (req, res) => {
    const { type, limit } = req.query;
    const revenue = await statisticsServices.getRevenueStatistics(type, limit);
    res.status(httpStatus.OK).send(revenue);
});


export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getProductRevenueStatistics,
    getProductSoldStatistics,
    getRevenueStatistics
};