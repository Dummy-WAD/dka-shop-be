import db from '../models/models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { AccountStatus, StatisticsPeriod, UserRole } from '../utils/enums.js';

const generatePeriods = (startPeriod, unit, limit) => {
    let periods = [];
    let currentPeriod = startPeriod;

    for (let i = 0; i < limit; i++) {
        periods.push(currentPeriod);

        if (unit === 'year') {
            currentPeriod = `${parseInt(currentPeriod) - 1}`;
        } else if (unit === 'quarter') {
            let [year, quarter] = currentPeriod.split('-').map(Number);
            quarter -= 1;
            if (quarter <= 0) {
                quarter = 4;
                year -= 1;
            }
            currentPeriod = `${year}-${String(quarter).padStart(2, '0')}`;
        } else if (unit === 'month') {
            let [year, month] = currentPeriod.split('-').map(Number);
            month -= 1;
            if (month <= 0) {
                month = 12;
                year -= 1;
            }
            currentPeriod = `${year}-${String(month).padStart(2, '0')}`;
        } else if (unit === 'week') {
            let [year, week] = currentPeriod.split('-').map(Number);
            week -= 1;
            if (week <= 0) {
                week = 52;
                year -= 1;
            }
            currentPeriod = `${year}-${String(week).padStart(2, '0')}`;
        }
    };

    return periods;
};

const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const diff = date - startDate;
    const oneDay = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil(dayOfYear / 7);
};

const generatePeriodForType = (type, limit) => {
    let dateFormat;
    let interval;
    let allPeriods = [];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);
    const currentWeek = getWeekNumber(currentDate);

    switch (type) {
        case StatisticsPeriod.YEAR:
            dateFormat = "YEAR(created_at)";
            interval = 'year';
            allPeriods = generatePeriods(`${currentYear}`, 'year', limit);
            break;
    
        case StatisticsPeriod.QUARTER:
            dateFormat = "CONCAT(YEAR(created_at), '-', LPAD(QUARTER(created_at), 2, '0'))";
            interval = 'quarter';
            allPeriods = allPeriods.concat(generatePeriods(`${currentYear}-${String(currentQuarter).padStart(2, '0')}`, 'quarter', limit));
            break;
    
        case StatisticsPeriod.MONTH:
            dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
            interval = 'month';
            allPeriods = allPeriods.concat(generatePeriods(`${currentYear}-${String(currentMonth).padStart(2, '0')}`, 'month', limit));
            break;
    
        case StatisticsPeriod.WEEK:
            dateFormat = "CONCAT(YEAR(created_at), '-', LPAD(WEEK(created_at, 1), 2, '0'))";
            interval = 'week';
            allPeriods = generatePeriods(`${currentYear}-${String(currentWeek).padStart(2, '0')}`, 'week', limit);
            break;
    
        default: throw new Error("Invalid statistics period type");
    };

    return { dateFormat, interval, allPeriods };
};

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

    const result = allPeriods.map(period => {
        const dataForPeriod = customerData.find(item => item?.period == period);
        return {
            period: period,
            count: dataForPeriod?.count ?? 0
        };
    });

    return {
        todayCount: todayCustomerStatistics?.get({ plain: true })?.count ?? 0,
        results: result.reverse()
    };
};

export default {
    getNewCustomerStatistics
};
