import db from '../models/models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { AccountStatus, UserRole } from '../utils/enums.js';
import { generatePeriodForType } from '../utils/statistics.js'; 

const getNewCustomerStatistics = async (type, limit) => {
    const { dateFormat, interval, allPeriods } = generatePeriodForType(type, limit);

    const todayCustomerStatistics = await db.user.findOne({
        attributes: [
            [literal("DATE(created_at)"), 'period'],
            [fn('COUNT', col('id')), 'count']
        ],
        where: {
            createdAt: {
                [Op.gte]: fn('CURDATE')
            },
            status: AccountStatus.ACTIVE,
            role: UserRole.CUSTOMER
        },
        group: [literal("DATE(created_at)")],
        nest: true
    });

    const customers = await db.user.findAll({
        attributes: [
            [literal(dateFormat), interval],
            [fn('COUNT', col('id')), 'count']
        ],
        where: {
            createdAt: {
                [Op.gte]: fn('DATE_SUB', fn('CURDATE'), literal(`INTERVAL ${limit} ${interval}`))
            },
            status: AccountStatus.ACTIVE,
            role: UserRole.CUSTOMER
        },
        group: [literal(dateFormat)],
        nest: true
    });

    const customerData = customers.map(customer => {
        const customerPlain = customer.get({ plain: true });
        return {
            period: customerPlain[interval],
            count: customerPlain.count
        };
    });

    const results = allPeriods.map(period => {
        const dataForPeriod = customerData.find(item => item?.period == period);
        return {
            period: period,
            count: dataForPeriod?.count ?? 0
        };
    });

    return {
        todayCount: todayCustomerStatistics?.get({ plain: true })?.count ?? 0,
        results: results.reverse()
    };
};

export default {
    getNewCustomerStatistics
};
