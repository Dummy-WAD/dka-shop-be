import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';
import {OrderStatus, UserRole} from '../utils/enums.js';
import { Op } from 'sequelize';
import productService from "./product.service.js";
import addressService from "./address.service.js";
import notificationService from './notification.service.js';

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
                [Op.or]: [
                    { '$user.email$': { [Op.like]: `%${keyword}%` } },
                    { id: keyword }
                ]
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
        attributes: ['id', 'customer_id', 'total', 'delivery_fee', 'status', 'created_at', 'updated_at', 'address', 'contact_name', 'phone_number', "packaged_at", "delivered_at", "completed_at", "cancelled_at", "delivery_service_id"],
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
        address, contact_name, phone_number, packaged_at, delivered_at, completed_at, cancelled_at, deliveryService: deliveryServiceData
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
            cancelled: {
                name: "Cancelled",
                at: cancelled_at,
            },
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
        attributes: ['id', 'customer_id', 'total', 'delivery_fee', 'status', 'created_at', 'updated_at', 'address', 'contact_name', 'phone_number', "packaged_at", "delivered_at", "completed_at", "cancelled_at", "delivery_service_id"],
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
        address, contact_name, phone_number, packaged_at, delivered_at, completed_at, cancelled_at, deliveryService: deliveryServiceData
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
            cancelled: {
                name: "Cancelled",
                at: cancelled_at,
            },
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

const prepareOrder = async (customerId, cartItemsParams, deliveryServiceParams) => {

    let costChange = false;

    const cartItemEntities = await db.cartItem.findAll({
        where: {
            id: cartItemsParams.map(item => item.id)
        },
        include: {
            model: db.productVariant,
            attributes: ['id', 'quantity', 'color', 'size', 'productId'],
            where: { isDeleted: false },
            include: {
                model: db.product,
                attributes: ['name'],
                where: { isDeleted: false },
                include: {
                    model: db.productImage,
                    attributes: ['imageUrl'],
                    where: { isPrimary: true }
                }
            }
        }
    });

    const productIds = cartItemEntities.map(item => item.productVariant.productId);
    const productPrices = await productService.getDiscountedPriceOfProducts(productIds);

    const preparedOrderItems = cartItemsParams.map(itemParams => {
        const { id } = itemParams;
        const item = cartItemEntities.find(item => item.id === id);

        if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found!');

        if (item.quantity > item.productVariant.quantity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity of product is not enough!');
        }

        const isPriceChange = itemParams.currentPrice !== productPrices[item.productVariant.productId];

        if (isPriceChange) {
            costChange = true;
        }

        return {
            cartItemId: id,
            productVariantId: item.productVariant.id,
            name: item.productVariant.product.name,
            image: item.productVariant.product.productImages[0].imageUrl,
            color: item.productVariant.color,
            size: item.productVariant.size,
            quantity: item.quantity,
            price: productPrices[item.productVariant.productId],
            isPriceChange
        };
    });

    const deliveryServiceEntity = await db.deliveryService.findOne({
        where: {
            id: deliveryServiceParams.id,
            isActive: true
        },
        attributes: ['id', 'name', 'deliveryFee']
    });

    if (!deliveryServiceEntity) throw new ApiError(httpStatus.NOT_FOUND, 'Delivery service not found!');

    const deliveryService = deliveryServiceEntity.get({ plain: true });
    if (deliveryService.deliveryFee !== deliveryServiceParams.deliveryFee) {
        costChange = true;
        deliveryService.isPriceChange = true;
    }

    const productCost = preparedOrderItems.reduce((acc, { price, quantity }) => acc + (price * quantity), 0);
    const totalCost = productCost + deliveryService.deliveryFee;

    return {
        preparedOrderItems,     // Item will be added to the order
        deliveryService,        // Delivery service will be used for the order
        productCost,            // Total cost of products
        totalCost,              // Total cost of the order (product cost + delivery fee)
        costChange              // Flag to indicate if there is a change in the cost
    }
};

const placeOrder = async (customerId, orderItemsParams, deliveryServiceParams, addressId) => {

    const transaction = await db.sequelize.transaction();

    try {
        const productVariantEntities = await db.productVariant.findAll({
            where: {
                id: orderItemsParams.map(item => item.productVariantId),
                isDeleted: false
            },
            include: {
                model: db.product,
                attributes: ['id', 'name'],
                where: { isDeleted: false }
            },
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        const productIds = productVariantEntities.map(item => item.productId);
        const productPrices = await productService.getDiscountedPriceOfProducts(productIds);

        let orderItems = orderItemsParams.map(itemParams => {
            const { productVariantId } = itemParams;
            const variant = productVariantEntities.find(variant => variant.id === productVariantId);

            if (!variant) throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found!');

            if (variant.quantity < itemParams.quantity) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity of product is not enough!');
            }

            if (itemParams.currentPrice !== productPrices[variant.productId]) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'Price of product has changed!');
            }

            variant.quantity -= itemParams.quantity;

            return {
                productVariantId,
                productName: variant.product.name,
                size: variant.size,
                color: variant.color,
                quantity: itemParams.quantity,
                price: productPrices[variant.productId],
            };
        });

        const deliveryServiceEntity = await db.deliveryService.findOne({
            where: {
                id: deliveryServiceParams.id,
                isActive: true
            },
            attributes: ['id', 'name', 'deliveryFee']
        });

        if (!deliveryServiceEntity) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Delivery service not found!');
        }

        if (deliveryServiceEntity.deliveryFee !== deliveryServiceParams.deliveryFee) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Delivery fee has changed!');
        }

        const addressDetails = await addressService.getAddressDetails(customerId, addressId);

        const orderEntity = await db.order.create({
            customerId,
            contactName: addressDetails.contactName,
            phoneNumber: addressDetails.phoneNumber,
            address: addressDetails.localAddress + ', ' + addressDetails.ward.nameEn + ', ' + addressDetails.district.nameEn + ', ' + addressDetails.province.nameEn,
            deliveryServiceId: deliveryServiceEntity.id,
            deliveryFee: deliveryServiceEntity.deliveryFee,
            total: orderItems.reduce((acc, { price, quantity }) => acc + (price * quantity), 0),
            status: OrderStatus.PENDING,
        }, { transaction });

        orderItems = orderItems.map(item => ({ ...item, orderId: orderEntity.id }));
        await db.orderItem.bulkCreate(orderItems, { transaction });

        await Promise.all(productVariantEntities.map(entity => entity.save({ transaction })));

        await db.cartItem.destroy({
            where: {
                productVariantId: orderItemsParams.map(item => item.productVariantId),
                userId: customerId
            },
            transaction
        });

        await transaction.commit();

        // Create notification
        notificationService.createOrderNotification(customerId, orderEntity);

        return {
            orderInformation: {
                orderId: orderEntity.id,
                total: orderEntity.total + orderEntity.deliveryFee,
                status: orderEntity.status,
                createdAt: orderEntity.createdAt,
            },
        }
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
}

const orderStatusConditions = {
    [OrderStatus.PENDING]: [],
    [OrderStatus.PACKAGING]: [OrderStatus.PENDING],
    [OrderStatus.DELIVERING]: [OrderStatus.PACKAGING],
    [OrderStatus.COMPLETED]: [OrderStatus.DELIVERING],
    [OrderStatus.CANCELLED]: [OrderStatus.PENDING, OrderStatus.PACKAGING]
}

const updateOrderStatus = async (orderId, newStatus, reason = null) => {
    const order = await db.order.findByPk(orderId);

    if (!order) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
    }

    if (order.status === newStatus) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Order status is already ' + newStatus);
    }

    if (!orderStatusConditions[newStatus].includes(order.status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Order cannot be updated to ' + newStatus);
    }

    if (newStatus === OrderStatus.CANCELLED) {
        order.cancelReason = reason;
        await restoreStockQuantity(order);
    }
    // Update order's status
    order.status = newStatus;
    // Update order's status time
    await updateOrderStatusTime(order, newStatus);
    await order.save();

    // Create notification
    notificationService.updateOrderStatusNotification(order, newStatus);

    return {
        orderId: order.id,
        status: order.status,
        updatedAt: order.updatedAt
    };
};

const updateOrderStatusTime = async (order, newStatus) => {
    switch (newStatus) {
        case OrderStatus.CANCELLED:
            order.cancelledAt = new Date();
            break;
        case OrderStatus.PACKAGING:
            order.packagedAt = new Date();
            break;
        case OrderStatus.DELIVERING:
            order.deliveredAt = new Date();
            break;
        case OrderStatus.COMPLETED:
            order.completedAt = new Date();
            break;
        default:
            break;
    }
}

const restoreStockQuantity = async (order) => {
    const orderItems = await db.orderItem.findAll({
        where: {
            orderId: order.id
        },
        include: {
            model: db.productVariant,
            attributes: ['id', 'quantity']
        }
    });

    await Promise.all(orderItems.map(async item => {
        const variant = item.productVariant;
        variant.quantity += item.quantity;
        await variant.save();
    }));
}

export default {
    getOrdersByCustomer,
    getOrdersByAdmin,
    getMyOrders,
    getOrderById,
    getCustomerOrderById,
    prepareOrder,
    placeOrder,
    updateOrderStatus
};
