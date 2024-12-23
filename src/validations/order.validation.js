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

const getOrdersByAdmin = {
    query: Joi.object().keys({
        keyword: Joi.string().trim().max(50).optional(),
        status: Joi.string().valid(...Object.values(OrderStatus)),
        sortBy: Joi.string().valid('orderId', 'email', 'totalPrice', 'createdAt', 'updatedAt').default('createdAt'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    })
};

const getMyOrders = {
    query: Joi.object().keys({
        status: Joi.string().valid(...Object.values(OrderStatus)),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(5)
    })
};

const getOrderById = {
    params: Joi.object().keys({
        orderId: Joi.number().integer().positive().required()
    })
};

const getCustomerOrderById = {
    params: Joi.object().keys({
        orderId: Joi.number().integer().positive().required()
    })
};

const prepareOrder = {
    body: Joi.object().keys({
        cartItems: Joi.array().items(
          Joi.object().keys({
            id: Joi.number().integer().positive().required(),
            currentPrice: Joi.number().positive().required()
        })).min(1).required(),
        deliveryService: Joi.object().keys({
            id: Joi.number().integer().positive().required(),
            deliveryFee: Joi.number().positive().required()
        }).required(),
    })
}

const placeOrder = {
    body: Joi.object().keys({
        orderItems: Joi.array().items(
          Joi.object().keys({
            productVariantId: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().positive().required(),
            currentPrice: Joi.number().positive().required()
        })).min(1).required(),
        deliveryService: Joi.object().keys({
            id: Joi.number().integer().positive().required(),
            deliveryFee: Joi.number().positive().required()
        }).required(),
        addressId: Joi.number().integer().positive().required()
    })
}

const updateOrderStatus = {
    params: Joi.object().keys({
        orderId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        status: Joi.string().valid(...Object.values(OrderStatus)).required(),
        cancelReason: Joi.string().trim().max(255).when('status', {
            is: OrderStatus.CANCELLED,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
    })
}

const cancelOrderAsCustomer = {
    params: Joi.object().keys({
        orderId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        cancelReason: Joi.string().trim().max(255).required()
    })
}

export default {
    getOrdersByCustomer,
    getOrdersByAdmin,
    getMyOrders,
    getOrderById,
    getCustomerOrderById,
    prepareOrder,
    placeOrder,
    updateOrderStatus,
    cancelOrderAsCustomer
}
