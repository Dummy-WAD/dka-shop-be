import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { reviewServices } from '../services/index.js';
import pick from '../utils/pick.js';

const createNewReview = catchAsync(async (req, res) => {
    await reviewServices.createNewReview(req.user.id, req.body);
    res.status(httpStatus.CREATED).send({ message: 'Product rated and reviewed successfully.'});
});

const getReviewsByProduct = catchAsync(async (req, res) => {
    const productId = req.params.productId;
    const filter = pick(req.query, ['rating']);
    const options = pick(req.query, ['limit', 'page']);
    const reviews = await reviewServices.getReviewsByProduct(productId, filter, options);
    res.status(httpStatus.OK).send(reviews);
});

export default {
    createNewReview,
    getReviewsByProduct
}