import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from 'http-status';
import { OrderStatus } from "../utils/enums.js";

const createNewReview = async (customerId, payload) => {
    const { orderItemId } = payload;

    const orderItem = await db.orderItem.findOne({
        where: { id: orderItemId },
        attributes: [],
        include: {
            model: db.order,
            attributes: ['status'],
            where: { customerId }
        }
    });
    if (!orderItem) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order item not found');
    };
    
    const existingReview  = await db.review.findOne({
        where: { orderItemId }
    });
    if (existingReview) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'This product has already been reviewed');
    };

    if (orderItem.order?.status !== OrderStatus.COMPLETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot review this product');
    };

    await db.review.create(payload);
};

export default {
    createNewReview
}