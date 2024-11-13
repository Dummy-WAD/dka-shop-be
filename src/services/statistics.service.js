import db from '../models/models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { AccountStatus, OrderStatus, UserRole } from '../utils/enums.js';
import { generatePeriodForType } from '../utils/statistics.js'; 

const getStatistics = async (model, type, limit, conditions = {}, calculate = false) => {
    const { dateFormat, interval, allPeriods } = generatePeriodForType(type, limit);

    const todayStatistics = await model.findOne({
        attributes: [
            [literal("DATE(created_at)"), 'period'],
            ...(calculate ? [[literal("SUM(total + delivery_fee)"), 'totalRevenue']] : [[fn('COUNT', col('id')), 'count']])
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
            ...(calculate ? [[literal("SUM(total + delivery_fee)"), 'totalRevenue']] : [[fn('COUNT', col('id')), 'count']])
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
    return getStatistics(db.order, type, limit, {
        status: { [Op.ne]: OrderStatus.CANCELLED }
    });
};

const getRevenueStatistics = async (type, limit) => {
    return getStatistics(db.order, type, limit, {
        status: OrderStatus.COMPLETED
    }, true);
};

export default {
    getNewCustomerStatistics,
    getOrderStatistics,
    getRevenueStatistics
};
