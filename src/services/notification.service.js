import db from '../models/models/index.js';
import {OrderStatus, NotificationType} from '../utils/enums.js';

const createOrderNotification = async (customerId, order) => {
    // =================================================
    // TODO: Create notification on order creation
    // =================================================
    const customer = await db.user.findOne({
        where: {
            id: customerId
        },
    });

    // Create notification for admin
    await db.notification.create({
        title: 'New order has been placed!',
        content: `Order ID ${order.id} has been placed by ${customer.firstName} ${customer.lastName} | ${customer.email}`,
        type: NotificationType.ORDER,
        artifactId: order.id
    });

    // Create notification for customer
    await db.notification.create({
        customerId: customerId,
        title: 'Your order is confirmed!',
        content: `Thanks for your order, ${customer.firstName} ${customer.lastName}. We will prepare it immediately`,
        type: NotificationType.ORDER,
        artifactId: order.id
    });
}

const updateOrderStatusNotification = async (order, status) => {
    // =================================================
    // TODO: Create notification on order status change
    // =================================================
    let titleNotification = '';
    let contentNotification = '';
    switch (status) {
        case OrderStatus.PACKAGING:
            titleNotification = 'Your order is accepted!';
            contentNotification = `Your order ${order.id} is accepted and is being packaging`;
            break;
        case OrderStatus.DELIVERING:
            titleNotification = 'Your order is packaged and is on the way!';
            contentNotification = `Your order ${order.id} is on the way to you`;
            break;
        case OrderStatus.COMPLETED:
            titleNotification = 'Your order has arrived!';
            contentNotification = `Your order ${order.id} has arrived. Enjoy your purchase!`;
            break;
        case OrderStatus.CANCELLED:
            titleNotification = 'Your order has been cancelled';
            contentNotification = `Your order ${order.id} has been cancelled due to: ${order.cancelReason}. Please contact us for more information`;
            break;
        default:
            break;
    }

    await db.notification.create({
        customerId: order.customerId,
        title: titleNotification,
        content: contentNotification,
        type: NotificationType.ORDER,
        artifactId: order.id
    });
}

const applyDiscountOnProductNotification = async (productIds) => {
    // ============================================================================
    // TODO: Notify user have products applied discount successfully
    // ============================================================================
    const query = `
        SELECT 
        c.id as cardId,
        p.id as productId,
        c.user_id as userId,
        p.name as productName,
        pv.color as productColor,
        pv.size as productSize
        FROM cart_items c
        INNER JOIN product_variants pv ON pv.id = c.product_variant_id and pv.is_deleted = 0
        INNER JOIN products p ON p.id = pv.product_id and p.is_deleted = 0
        where p.id in (${productIds.join(',')})
    `

    const productsInCart = await db.sequelize.query(query, { type: db.Sequelize.QueryTypes.SELECT});

    const notificationPayload = productsInCart.map(notify => ({
        customerId: notify.userId,
        title: `Discount applied`,
        content: `Your ${notify.productName} - ${notify.productColor} - ${notify.productSize} is on sale for a limited time. Grab it now!`,
        type: NotificationType.DISCOUNT,
        artifactId: notify.productId,
    }));

    await db.notification.bulkCreate(notificationPayload);
};

const getNotifications = async (filter, options) => {
    const { after, limit } = options;

    const queryOptions = {
        where: {
            customerId: filter.id,
            ...(after && {
                createdAt: {
                    [db.Sequelize.Op.lt]: new Date(after),
                },
            }),
        },
        order: [['createdAt', 'desc']],
        limit: limit + 1,
        attributes: {
            exclude: ['customer_id'],
        },
    };

    const notifications = await db.notification.findAll(queryOptions);

    const isLast = notifications.length <= limit;

    const results = notifications.slice(0, limit);

    const nextCursor =
        results.length > 0
            ? results[results.length - 1].createdAt
            : null;

    return {
        results,
        nextCursor: nextCursor ? nextCursor.toISOString() : null,
        isLast,
    };
}

const getNotificationsCount = async (userId) => {
    return await db.notification.count({
        where: { customerId: userId, seen: false }
    });
};

const markNotificationsAsRead = async (userId) => {
    await db.notification.update(
        { seen: true },
        { where: { customerId: userId, seen: false } }
    );
};

const cancelOrderNotification = async (customerId, order) => {
    const customer = await db.user.findOne({
        where: {
            id: customerId
        },
    });

    // Create notification for customer
    await db.notification.create({
        customerId: order.customerId,
        title: 'Your order has been cancelled',
        content: 'Your order has been cancelled successfully. Hope to assist you with another order soon.',
        type: NotificationType.ORDER,
        artifactId: order.id
    });

    // Create notification for admin
    await db.notification.create({
        title: 'Order has been cancelled',
        content: `Order ID ${order.id} has been cancelled by ${customer.firstName} ${customer.lastName} | ${customer.email}`,
        type: NotificationType.ORDER,
        artifactId: order.id
    });
}


export default {
    createOrderNotification,
    updateOrderStatusNotification,
    applyDiscountOnProductNotification,
    getNotifications,
    getNotificationsCount,
    markNotificationsAsRead,
    cancelOrderNotification
}