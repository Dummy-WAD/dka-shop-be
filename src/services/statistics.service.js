import db from '../models/models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { AccountStatus, OrderStatus, UserRole } from '../utils/enums.js';
import { generatePeriodForType } from '../utils/statistics.js'; 

const getStatistics = async (model, type, limit, conditions = {}, dateField = 'created_at', calculate = false) => {
    const { dateFormat, interval, allPeriods } = generatePeriodForType(type, limit, dateField);

    const todayStatistics = await model.findOne({
        attributes: [
            [literal(`DATE(${dateField})`), 'period'],
            ...(calculate ? [[literal("SUM(total + delivery_fee)"), 'totalRevenue']] : [[fn('COUNT', col('id')), 'count']])
        ],
        where: { 
            ...conditions, 
            [dateField]: { [Op.gte]: fn('CURDATE') } 
        },
        group: [literal(`DATE(${dateField})`)],
        nest: true
    });

    const records = await model.findAll({
        attributes: [
            [literal(dateFormat), interval],
            ...(calculate ? [[literal("SUM(total + delivery_fee)"), 'totalRevenue']] : [[fn('COUNT', col('id')), 'count']])
        ],
        where: {
            ...conditions,
            [dateField]: {
                [Op.gte]: fn('DATE_SUB', fn('CURDATE'), literal(`INTERVAL ${limit} ${interval}`))
            }
        },
        group: [literal(dateFormat)],
        nest: true
    });

    const recordData = records.map(record => {
        const recordPlain = record.get({ plain: true });
        return {
            period: recordPlain[interval],
            ...(calculate ? { totalRevenue: recordPlain.totalRevenue } : { count: recordPlain.count })
        };
    });

    const results = allPeriods.map(period => {
        const dataForPeriod = recordData.find(item => item?.period == period);
        return {
            period: period,
            ...(calculate ? { totalRevenue: dataForPeriod?.totalRevenue ?? 0 } : { count: dataForPeriod?.count ?? 0 })
        };
    });

    return {
        todayCount: todayStatistics?.get({ plain: true })?.[calculate ? 'totalRevenue' : 'count'] ?? 0,
        results: results.reverse()
    };
};

const getNewCustomerStatistics = async (type, limit) => {
    return getStatistics(db.user, type, limit, {
        status: AccountStatus.ACTIVE,
        role: UserRole.CUSTOMER
    });
};

const getOrderStatistics = async (type, limit) => {
    const createdAtStatistics = await getStatistics(db.order, type, limit, {}, 'created_at');
    const completedAtStatistics = await getStatistics(db.order, type, limit, {}, 'completed_at');

    const mergedResults = createdAtStatistics.results.map((createdAtRecord) => {
        const completedAtRecord = completedAtStatistics.results.find(item => item.period === createdAtRecord.period) || { count: 0 };
        return {
            period: createdAtRecord.period,
            count: createdAtRecord.count,
            completedOrdersCount: completedAtRecord.count
        };
    });

    return {
        todayCount: createdAtStatistics.todayCount,
        results: mergedResults
    };
};


const getProductRevenueStatistics = async (orderType, limit) => {
    let sqlQuery = `
        SELECT pv.product_id as productId,
                p.name AS productName,
                pi.image_url AS productImage,
                SUM(oi.quantity) AS totalQuantity,
                SUM(oi.price * oi.quantity) AS totalPrice
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id and o.status = '${OrderStatus.COMPLETED}'
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        INNER JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        GROUP BY pv.product_id, pi.image_url
    `;

    sqlQuery += ` ORDER BY totalPrice ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

const getProductSoldStatistics = async (orderType, limit) => {
    let sqlQuery = `
         SELECT pv.product_id as productId,
                p.name AS productName,
                pi.image_url AS productImage,
                SUM(oi.quantity) AS totalQuantity,
                SUM(oi.price * oi.quantity) AS totalPrice
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id and o.status = '${OrderStatus.COMPLETED}'
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        INNER JOIN product_images pi ON pi.product_id = p.id and pi.is_primary = 1
        GROUP BY pv.product_id, pi.image_url
    `;
    
    sqlQuery += ` ORDER BY totalQuantity ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

const getCategoryRevenueStatistics = async (orderType, limit) => {
    let sqlQuery = `
        SELECT  c.name as categoryName,
                p.category_id as categoryId,
                SUM(oi.quantity) AS totalQuantity,
                SUM(oi.price * oi.quantity) AS totalPrice
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id and o.status = '${OrderStatus.COMPLETED}'
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        INNER JOIN categories as c ON c.id = p.category_id
        GROUP BY p.category_id, c.name
    `;

    sqlQuery += ` ORDER BY totalPrice ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

const getCategorySoldStatistics = async (orderType, limit) => {
    let sqlQuery = `
            SELECT c.name as categoryName,
            p.category_id as categoryId,
            SUM(oi.quantity) AS totalQuantity,
            SUM(oi.price * oi.quantity) AS totalPrice
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id and o.status = '${OrderStatus.COMPLETED}'
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        INNER JOIN categories as c ON c.id = p.category_id
        GROUP BY p.category_id, c.name
    `;

    sqlQuery += ` ORDER BY totalQuantity ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

const getRevenueStatistics = async (type, limit) => {
    return getStatistics(db.order, type, limit, {
        status: OrderStatus.COMPLETED
    }, 'completed_at', true);
};

export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getProductRevenueStatistics,
    getProductSoldStatistics,
    getCategoryRevenueStatistics,
    getCategorySoldStatistics,
    getRevenueStatistics
};
