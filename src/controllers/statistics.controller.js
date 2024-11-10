import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { statisticsServices } from '../services/index.js';

const getNewCustomerStatistics = catchAsync(async (req, res) => {
    const { type, limit } = req.query;
    const numberOfNewCustomers = await statisticsServices.getNewCustomerStatistics(type, limit);
    res.status(httpStatus.OK).send(numberOfNewCustomers);
});

export default {
    getNewCustomerStatistics
};