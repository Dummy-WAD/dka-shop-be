import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from 'http-status';
import { OrderStatus } from "../utils/enums.js";
import { Op } from 'sequelize';

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

const getReviewsByProduct = async (productId, filter, options) => {
    const { limit, page } = options;

    const product = await db.product.findOne({
        where: { id: productId },
        attributes: ['name']
    });

    if (!product) {
        throw new Error('Product not found');
    }

    const productName = product.name;

    const orderItems = await db.orderItem.findAll({
        where: { productName },
        attributes: ['id'],
    });

    if (orderItems.length === 0) {
        return {
            results: [],
            page,
            limit,
            totalPages: 0,
            totalResults: 0
        };
    }

    const orderItemIds = orderItems.map(item => item.id);

    const whereCondition = {
        orderItemId: {
            [Op.in]: orderItemIds
        }
    };

    if (filter.rating) {
        whereCondition.rating = filter.rating;
    }

    const totalResults = await db.review.count({
        where: whereCondition,
    });

    const totalPages = Math.ceil(totalResults / limit);

    const reviews = await db.review.findAll({
        where: whereCondition,
        include: [{
            model: db.orderItem,
            attributes: ['size', 'color'],
            include: [{
                model: db.order,
                include: [{
                    model: db.user,
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                }]
            }]
        }],
        limit: parseInt(limit),
        offset: (page - 1) * parseInt(limit),
        order: [['updatedAt', 'DESC']],
    });

    const formattedReviews = reviews.map(review => {
        return {
            id: review.id,
            orderItemId: review.orderItemId,
            rating: review.rating,
            reviewText: review.reviewText,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            orderItem: {
                size: review.orderItem.size,
                color: review.orderItem.color,
            },
            customer: {
                id: review.orderItem.order.user.id,
                firstName: review.orderItem.order.user.firstName,
                lastName: review.orderItem.order.user.lastName,
                email: review.orderItem.order.user.email,
            }
        };
    });

    return {
        results: formattedReviews,
        page,
        limit,
        totalPages,
        totalResults
    };
};

export default {
    createNewReview,
    getReviewsByProduct
}