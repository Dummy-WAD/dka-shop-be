import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { reviewServices } from '../services/index.js';

const createNewReview = catchAsync(async (req, res) => {
    await reviewServices.createNewReview(req.body);
    res.status(httpStatus.CREATED).send({ message: 'Product rated and reviewed successfully.'});
});


export default {
    createNewReview
}