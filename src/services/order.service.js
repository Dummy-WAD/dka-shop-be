import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import { UserRole } from '../utils/enums.js';
import { Op } from 'sequelize';

const getOrdersByCustomer = async (filter, options, id) => {
    const customer = await db.user.findOne({
        where: {
            id: id.customerId,
            role: UserRole.CUSTOMER
        }
    });
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found!');
    const selectedAttributes = ['id', 'total', 'deliveryFee', 'status', 'createdAt', 'updatedAt'];
    return await paginate(db.order, { ...filter, customerId: id.customerId }, options, [], [], selectedAttributes);
};

const getOrdersByAdmin = async (filter, options) => {
    const { sortBy, order, limit: optionsLimit, page: optionsPage } = options;
    const { keyword, status } = filter;

    const allOrders = await db.order.findAll({
        where: {
            ...(status && { status }),
            ...(keyword && {
                '$user.email$': {
                    [Op.like]: `%${keyword}%`
                }
            })
        },
        attributes: [
            ['id', 'orderId'],
            [db.Sequelize.literal('total + delivery_fee'), 'totalPrice'],
            ['status', 'currentStatus'],
            'createdAt',
            'updatedAt'
        ],
        include: {
            model: db.user,
            attributes: ['email', 'id']
        },
        nest: true
    });

    const sortOrders = allOrders.map(order => {
        const { orderId, user, totalPrice, currentStatus, createdAt, updatedAt } = order.get({ plain: true });

        return {
            orderId,
            email: user.email,
            customerId: user.id,
            totalPrice,
            currentStatus,
            createdAt,
            updatedAt
        };
    });

    sortOrders.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    const limit = optionsLimit ? parseInt(optionsLimit, 10) : 10;
    const page = optionsPage ? parseInt(optionsPage, 10) : 1;
    const offset = limit ? (page - 1) * limit : 0;
    const paginatedOrders = limit ? sortOrders.slice(offset, offset + limit) : sortOrders;

    const totalResults = allOrders.length;
    const totalPages = limit ? Math.ceil(totalResults / limit) : 1;

    return {
        results: paginatedOrders,
        page,
        limit,
        totalPages,
        totalResults
    };
};

const getMyOrders = async (filter, options) => {
    const { limit: optionsLimit, page: optionsPage } = options;
    const { status } = filter;

    const allOrders = await db.order.findAll({
        where: {
            customerId: filter.id,
            ...(status && { status })
        },
        attributes: [
            ['id', 'orderId'],
            [db.Sequelize.literal('total + delivery_fee'), 'totalPrice'],
            ['status', 'currentStatus'],
            'createdAt'
        ],
        include: {
            model: db.productVariant,
            through: { attributes: ['productName', 'price', 'quantity', 'size', 'color'] },
            attributes: ['productId'],
            include: {
                model: db.product,
                attributes: ['id', 'name'],
                include: {
                    model: db.productImage,
                    attributes: ['imageUrl'],
                    where: { isPrimary: true }
                }
            }
        },
        order: [['createdAt', 'desc']],
        nest: true
    });

    const limit = optionsLimit ? parseInt(optionsLimit, 10) : undefined;
    const page = optionsPage ? parseInt(optionsPage, 10) : 1;
    const offset = limit ? (page - 1) * limit : 0;
    const paginatedOrders = limit ? allOrders.slice(offset, offset + limit) : allOrders;

    const flatData = paginatedOrders.map(order => {
        const { orderId, totalPrice, currentStatus, createdAt, productVariants } = order.get({ plain: true });

        const firstVariant = productVariants[0] || {};
        const { productId = null, product: { productImages = [] } = {},
            orderItem: { productName = null, price = null, quantity = null, size = null, color = null } = {}
        } = firstVariant;

        return {
            orderId,
            totalPrice,
            currentStatus,
            numberOfOrderItems: productVariants.length,
            createdAt,
            orderItem: {
                productId, size, color, productName,
                productImageUrl: productImages[0]?.imageUrl || null,
                price,
                quantity
            }
        };
    });

    const totalResults = allOrders.length;
    const totalPages = limit ? Math.ceil(totalResults / limit) : 1;

    return {
        results: flatData,
        page,
        limit,
        totalPages,
        totalResults
    };
};

const getOrderById = async (orderId) => {
    // Find order by id

    const order = await db.order.findByPk(orderId, {
        attributes: ['id', 'customer_id', 'total', 'delivery_fee', 'status', 'created_at', 'updated_at', 'address', 'contact_name', 'phone_number', "packaged_at", "delivered_at", "completed_at", "delivery_service_id"],
        include: {
                model: db.productVariant,
                attributes: ['product_id'],
                include: {
                    model: db.product,
                    attributes: ['name'],
                    include: {
                        model: db.productImage,
                        attributes: ['image_url'],
                        where: { is_primary: true }
                    }
                },
                through: {
                    attributes: ['product_name', 'price', 'quantity', 'size', 'color']
                }
            }
    });


    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    // find delivery service
    const deliveryService = await db.deliveryService.findByPk(order.dataValues.delivery_service_id, {
        attributes: ['name', 'description']
    });

    order.dataValues.deliveryService = deliveryService;

    const {
        id, customer_id, total, delivery_fee, status, created_at, updated_at,
        address, contact_name, phone_number, packaged_at, delivered_at, completed_at, deliveryService: deliveryServiceData
    } = order.dataValues;

    const orderDetailResponse = {
        id,
        customerId: customer_id,
        total,
        deliveryFee: delivery_fee,
        status,
        createdAt: created_at,
        updatedAt: updated_at,
        address,
        contactName: contact_name,
        phoneNumber: phone_number,
        history: {
            packaged: {
                name: "Packaged",
                at: packaged_at,
            },
            delivered: {
                name: "Delivered",
                at: delivered_at,
            },
            completed: {
                name: "Completed",
                at: completed_at,
            }
        },
        deliveryService: deliveryServiceData,
        orderItems: order.productVariants,
    };

    return orderDetailResponse;
};

const getCustomerOrderById = async (orderId, customerId) => {
    // Find order by id
    const order = await db.order.findByPk(orderId, {
        attributes: ['id', 'customer_id', 'total', 'delivery_fee', 'status', 'created_at', 'updated_at', 'address', 'contact_name', 'phone_number', "packaged_at", "delivered_at", "completed_at", "delivery_service_id"],
        include: {
                model: db.productVariant,
                attributes: ['product_id'],
                include: {
                    model: db.product,
                    attributes: ['name'],
                    include: {
                        model: db.productImage,
                        attributes: ['image_url'],
                        where: { is_primary: true }
                    }
                },
                through: {
                    attributes: ['product_name', 'price', 'quantity', 'size', 'color']
                }
            }
    });


    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    if (order.dataValues.customer_id !== customerId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access this order');
    }

    // find delivery service
    const deliveryService = await db.deliveryService.findByPk(order.dataValues.delivery_service_id, {
        attributes: ['name', 'description']
    });

    order.dataValues.deliveryService = deliveryService;

    const {
        id, customer_id, total, delivery_fee, status, created_at, updated_at,
        address, contact_name, phone_number, packaged_at, delivered_at, completed_at, deliveryService: deliveryServiceData
    } = order.dataValues;

    const orderDetailResponse = {
        id,
        customerId: customer_id,
        total,
        deliveryFee: delivery_fee,
        status,
        createdAt: created_at,
        updatedAt: updated_at,
        address,
        contactName: contact_name,
        phoneNumber: phone_number,
        history: {
            packaged: {
                name: "Packaged",
                at: packaged_at,
            },
            delivered: {
                name: "Delivered",
                at: delivered_at,
            },
            completed: {
                name: "Completed",
                at: completed_at,
            }
        },
        deliveryService: deliveryServiceData,
        orderItems: order.productVariants,
    };

    return orderDetailResponse;
};

export default {
    getOrdersByCustomer,
    getOrdersByAdmin,
    getMyOrders,
    getOrderById,
    getCustomerOrderById
};
