import db from '../models/models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { AccountStatus, OrderStatus, UserRole } from '../utils/enums.js';
import { generatePeriodForType } from '../utils/statistics.js'; 

const getStatistics = async (model, type, limit, conditions = {}) => {
    const { dateFormat, interval, allPeriods } = generatePeriodForType(type, limit);

    const todayStatistics = await model.findOne({
        attributes: [
            [literal("DATE(created_at)"), 'period'],
            [fn('COUNT', col('id')), 'count']
        ],
        where: { 
            ...conditions, 
            createdAt: { [Op.gte]: fn('CURDATE') } 
        },
        group: [literal("DATE(created_at)")],
        nest: true
    });

    const records = await model.findAll({
        attributes: [
            [literal(dateFormat), interval],
            [fn('COUNT', col('id')), 'count']
        ],
        where: {
            ...conditions,
            createdAt: {
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
            count: recordPlain.count
        };
    });

    const results = allPeriods.map(period => {
        const dataForPeriod = recordData.find(item => item?.period == period);
        return {
            period: period,
            count: dataForPeriod?.count ?? 0
        };
    });

    return {
        todayCount: todayStatistics?.get({ plain: true })?.count ?? 0,
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
    return getStatistics(db.order, type, limit, {
        status: { [Op.ne]: OrderStatus.CANCELLED }
    });
};


const getProductRevenueStatistics = async (orderType, limit) => {
    let sqlQuery = `
        SELECT pv.product_id,
            p.name AS product_name,
            pi.image_url AS product_image,
            SUM(oi.quantity) AS total_quantity,
            SUM(oi.price * oi.quantity) AS total_price
        FROM order_items oi
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
        GROUP BY pv.product_id, pi.image_url
    `;

    sqlQuery += ` ORDER BY total_price ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

const getProductSoldStatistics = async (orderType, limit) => {
    let sqlQuery = `
        SELECT pv.product_id,
        p.name AS product_name,
        pi.image_url AS product_image,
        SUM(oi.quantity) AS total_quantity
        FROM order_items oi
        INNER JOIN product_variants pv ON pv.id = oi.product_variant_id
        INNER JOIN products p ON p.id = pv.product_id
        LEFT JOIN product_images pi ON pi.product_id = p.id and pi.is_primary = 1
        GROUP BY pv.product_id, pi.image_url
    `;
    
    sqlQuery += ` ORDER BY total_quantity ${orderType}`;
    sqlQuery += ` LIMIT ${limit}`;
    const records = await db.sequelize.query(sqlQuery, { type: db.sequelize.QueryTypes.SELECT });
    return records;
}

export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getProductRevenueStatistics,
    getProductSoldStatistics
};
