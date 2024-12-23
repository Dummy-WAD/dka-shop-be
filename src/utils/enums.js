export const AccountStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
})

export const UserRole = Object.freeze({
    ADMIN: 'ADMIN',
    CUSTOMER: 'CUSTOMER'
})

export const Gender = Object.freeze({
    MALE: 'MALE',
    FEMALE: 'FEMALE'
});

export const DiscountType = Object.freeze({
    PRICE: 'PRICE',
    PERCENTAGE: 'PERCENTAGE'
});

export const ConfirmationTokenStatus = Object.freeze({
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED'
});

export const DeleteStatus = Object.freeze({
    DELETED: true,
    NOT_DELETED: false
});

export const OrderStatus = Object.freeze({
    PENDING: 'PENDING',
    PACKAGING: 'PACKAGING',
    DELIVERING: 'DELIVERING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
});

export const StatisticsPeriod = Object.freeze({
    YEAR: 'year',
    QUARTER: 'quarter',
    MONTH: 'month',
    WEEK: 'week'
});

export const OrderType = Object.freeze({
    DESC: 'DESC',
    ASC: 'ASC'
});

export const DiscountStatus = Object.freeze({
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED'
});

export const NotificationType = Object.freeze({
    ORDER: 'ORDER',
    DISCOUNT: 'DISCOUNT',
    SYSTEM: 'SYSTEM'
});