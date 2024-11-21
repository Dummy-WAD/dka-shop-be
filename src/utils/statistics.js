import { StatisticsPeriod } from "./enums.js";
import { getYear, getMonth, getWeek } from 'date-fns';

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


export const generatePeriodForType = (type, limit, dateField) => {
    let dateFormat;
    let interval;
    let allPeriods = [];

    const currentDate = new Date();
    const currentYear = getYear(currentDate);
    const currentMonth = getMonth(currentDate) + 1;
    const currentQuarter = Math.ceil(currentMonth / 3);
    const currentWeek = getWeek(currentDate);

    switch (type) {
        case StatisticsPeriod.YEAR:
            dateFormat = `YEAR(${dateField})`;
            interval = 'year';
            allPeriods = generatePeriods(`${currentYear}`, 'year', limit);
            break;
    
        case StatisticsPeriod.QUARTER:
            dateFormat = `CONCAT(YEAR(${dateField}), '-', LPAD(QUARTER(${dateField}), 2, '0'))`;
            interval = 'quarter';
            allPeriods = allPeriods.concat(generatePeriods(`${currentYear}-${String(currentQuarter).padStart(2, '0')}`, 'quarter', limit));
            break;
    
        case StatisticsPeriod.MONTH:
            dateFormat = `DATE_FORMAT(${dateField}, '%Y-%m')`;
            interval = 'month';
            allPeriods = allPeriods.concat(generatePeriods(`${currentYear}-${String(currentMonth).padStart(2, '0')}`, 'month', limit));
            break;
    
        case StatisticsPeriod.WEEK:
            dateFormat = `CONCAT(YEAR(${dateField}), '-', LPAD(WEEK(${dateField}, 1), 2, '0'))`;
            interval = 'week';
            allPeriods = generatePeriods(`${currentYear}-${String(currentWeek).padStart(2, '0')}`, 'week', limit);
            break;
    
        default: throw new Error("Invalid statistics period type");
    };

    return { dateFormat, interval, allPeriods };
};