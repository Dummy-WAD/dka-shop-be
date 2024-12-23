import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from 'http-status';
import { DiscountStatus} from "../utils/enums.js";
import notificationService from "./notification.service.js";
import { format } from 'date-fns';
import { convertTime } from "../utils/convert-time.js";

const getDiscountDetail = async (discountId) => {
    const currentDateLocal = format(new Date(), 'yyyy-MM-dd');

    const discount = await db.discountOffer.findOne({
        where: { id: discountId, isDeleted: false },
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'isDeleted'],
            include: [
                [
                    db.Sequelize.literal(`
                        CASE
                            WHEN DATE(start_date) > DATE('${currentDateLocal}') THEN '${DiscountStatus.UPCOMING}'
                            WHEN DATE(start_date) <= DATE('${currentDateLocal}') AND DATE(expiration_date) >= DATE('${currentDateLocal}') THEN '${DiscountStatus.ACTIVE}'
                            ELSE '${DiscountStatus.EXPIRED}'
                        END
                    `),
                    'status'
                ]
            ]
        },
        raw: true,
        nest: true
    });

    if (!discount) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
    };

    return discount;
};

const getAllProductsWithDiscount = async (filter, options) => {
    const { limit, page } = options;
    const offset = limit ? (page - 1) * limit : 0;

    const priceDiscountCalculate = (active) => `
        CASE 
            WHEN ${active ? "CURDATE() BETWEEN DATE(start_date) AND DATE(expiration_date)" : "TRUE"}
            AND discount_type = 'PRICE' THEN 
                CASE 
                    WHEN discount_value >= product.price THEN 0
                    ELSE product.price - discount_value
                END
            WHEN ${active ? "CURDATE() BETWEEN DATE(start_date) AND DATE(expiration_date)" : "TRUE"}
            AND discount_type = 'PERCENTAGE' THEN product.price - (product.price * discount_value / 100)
            ELSE product.price
        END
    `;

    const products = await db.product.findAll({
        where: { isDeleted: false },
        include: [
            {
                model: db.category,
                attributes: ['id', 'name']
            },
            {
                model: db.discountOffer,
                attributes: [
                    [db.sequelize.literal(priceDiscountCalculate(false)), 'priceDiscounted'],
                    [db.sequelize.literal(priceDiscountCalculate(true)), 'currentPrice']
                ],
                where: { ...filter, isDeleted: false }
            }
        ],
        attributes: [['id', 'productId'], ['name', 'productName'], ['price', 'originPrice']]
    });

    const transformedProducts = products.map(product => {
        const productPlain = product.get({ plain: true });
        return {
            ...productPlain,
            categoryName: productPlain.category.name,
            categoryId: productPlain.category.id,
            priceDiscounted: productPlain.discountOffers[0]?.priceDiscounted,
            currentPrice: productPlain.discountOffers[0]?.currentPrice,
            discountOffers: undefined,
            category: undefined
        };
    });

    const totalResults = transformedProducts.length;
    const totalPages = Math.ceil(totalResults / limit);
    const paginatedResults = transformedProducts.slice(offset, offset + limit);

    return {
        results: paginatedResults,
        limit,
        page,
        totalPages,
        totalResults
    };
};

const getAllProductsWithoutDiscount = async (filter, options) => {
    const { limit, page } = options;
    const offset = limit ? (page - 1) * limit : 0;

    const { discountId, keyword } = filter;

    const products = await db.product.findAll({
        where: {
            isDeleted: false,
            [db.Sequelize.Op.not]: [
                db.Sequelize.literal(`EXISTS (
                    SELECT 1 
                    FROM product_discount_offers pdo 
                    WHERE pdo.product_id = product.id 
                    AND pdo.discount_offer_id = ${discountId}
                )`)
            ],
            ...(keyword && { name: {
                    [db.Sequelize.Op.like]: `%${keyword}%`
                }})
        },
        include: [
            {
                model: db.category,
                attributes: ['id', 'name']
            }
        ],
        attributes: [['id', 'productId'], ['name', 'productName'], ['price', 'originPrice']],
        limit,
        offset
    });

    const totalResults = await db.product.count({
        where: {
            isDeleted: false,
            [db.Sequelize.Op.not]: [
                db.Sequelize.literal(`EXISTS (
                    SELECT 1 
                    FROM product_discount_offers pdo 
                    WHERE pdo.product_id = product.id 
                    AND pdo.discount_offer_id = ${discountId}
                )`)
            ],
            ...(keyword && { name: {
                [db.Sequelize.Op.like]: `%${keyword}%`
            }}),
        }
    });

    const totalPages = Math.ceil(totalResults / limit);

    const transformedProducts = products.map(product => {
        const productPlain = product.get({ plain: true });
        return {
            ...productPlain,
            categoryName: productPlain.category.name,
            categoryId: productPlain.category.id,
            category: undefined
        };
    });

    return {
        results: transformedProducts,
        page,
        limit,
        totalPages,
        totalResults
    };
};

const createDiscount = async (payload) => {
    const discountCreated = await db.discountOffer.create({ ...payload, isDeleted: false });
    return { discountId: discountCreated.id }
};

const editDiscount = async (discountId, payload) => {
    const discount = await db.discountOffer.findOne({ where: { id: discountId, isDeleted: false } });
    if (!discount) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
    };

    const startDate = payload?.startDate ?? discount.startDate;
    const expirationDate = payload?.expirationDate ?? discount.expirationDate;
    const currentDate = new Date().setHours(0, 0, 0, 0);

    const isValidStartDate = (date) => convertTime(date) >= currentDate;
    const isValidExpirationDate = (date) => convertTime(date) >= currentDate;
    const isValidExpirationAfterStartDate = (startDate, expirationDate) => convertTime(expirationDate) >= convertTime(startDate);
    const normalizeDate = (date) => date ? new Date(date).toISOString().split('T')[0] : null;

    if (!isValidExpirationDate(discount.expirationDate)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update the expired discount');
    };

    const isStartDateChanged = normalizeDate(payload?.startDate) !== normalizeDate(discount.startDate);
    const isExpirationDateChanged = normalizeDate(payload?.expirationDate) !== normalizeDate(discount.expirationDate);

    if (isStartDateChanged || isExpirationDateChanged) {
        if (payload?.startDate && !isValidStartDate(payload.startDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Start date must be greater than or equal to current date');
        }

        if (payload?.expirationDate && !isValidExpirationDate(payload.expirationDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Expiration date must be greater than or equal to current date');
        }

        if (!isValidExpirationAfterStartDate(startDate, expirationDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Expiration date must be greater than or equal to start date');
        }
    };

    await db.discountOffer.update(payload, { where: { id: discountId } });
};

const getAppliedDiscount = async (productId) => {

    const product = await db.product.findOne({
        where: { id: productId, isDeleted: false }
    });

    if (!product) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
    }

    const currentDate = new Date().setHours(0, 0, 0, 0);

    const appliedDiscount = await db.productDiscountOffer.findOne({
        where: {
            productId,
        },
        include: {
            model: db.discountOffer,
            where: {
                expirationDate: {[db.Sequelize.Op.gte]: currentDate},
                isDeleted: false,
            },
            attributes: ['id', 'discountValue', 'discountType', 'startDate', 'expirationDate']
        }
    });

    return { isDiscounted: !!appliedDiscount, activeDiscount: appliedDiscount?.discountOffer};
}

const applyDiscount = async (discountId, productIds) => {
    const transaction = await db.sequelize.transaction();

    try {
        const futureDiscount = await db.discountOffer.findOne({
            where: { id: discountId, isDeleted: false },
            transaction
        });

        if (!futureDiscount) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
        }

        const products = await db.product.findAll({
            where: {
                id: productIds,
                isDeleted: false
            },
            transaction
        });

        if (products.length !== productIds.length) {
            throw new ApiError(httpStatus.NOT_FOUND, 'One or more products not found');
        }

        const currentDate = new Date().setHours(0, 0, 0, 0);
        const isValidExpirationDate = (date) => convertTime(date) >= currentDate;

        if (!isValidExpirationDate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Discount has expired');
        }

        const existingDiscounts = await db.productDiscountOffer.findAll({
            where: {
                productId: productIds
            },
            include: {
                model: db.discountOffer,
                where: {
                    isDeleted: false
                }
            },
            transaction
        });

        const discountsToRemove = existingDiscounts.filter(item => {
            const currentDiscount = item.discountOffer;
            const expirationDateCurrent = new Date(currentDiscount.expirationDate).setHours(0, 0, 0, 0);
            return expirationDateCurrent >= currentDate;
        });

        if (discountsToRemove.length > 0) {
            await db.productDiscountOffer.destroy({
                where: {
                    productId: productIds,
                    discountOfferId: discountsToRemove.map(discount => discount.discountOffer.id)
                },
                transaction
            });
        }

        await db.productDiscountOffer.bulkCreate(
            productIds.map(productId => ({
                productId,
                discountOfferId: discountId
            })),
            { transaction }
        );
        await transaction.commit();

        notificationService.applyDiscountOnProductNotification(productIds);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteDiscount = async (discountId) => {
    const discount = await db.discountOffer.findOne({ where: { id: discountId, isDeleted: false } });
    if (!discount) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Discount not found');
    };

    // find all products that have this discount
    const qProducts = `
        SELECT * 
        FROM dka_shop.product_discount_offers pdo
        INNER JOIN discount_offers _do ON _do.id = pdo.discount_offer_id
        WHERE _do.expiration_date >= CURRENT_TIMESTAMP() and pdo.id = ${discountId}
    `;

    const products = await db.sequelize.query(qProducts, { type: db.sequelize.QueryTypes.SELECT });
    if (products.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Discount is being used by one or more products');
    }

    // check if discount has started
    if (discount.startDate <= new Date() && discount.expirationDate >= new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete discount that has started');
    }

    await db.discountOffer.update({ isDeleted: true }, { where: { id: discountId } });
};

const getAllDiscounts = async (filter, options) => {
    const currentDateLocal = format(new Date(), 'yyyy-MM-dd');

    const whereConditions = {
        isDeleted: false,
    };

    if (filter.keyword) {
        whereConditions.id = filter.keyword;
    }

    if (filter.type) {
        whereConditions.discountType = filter.type;
    }

    if (filter.startDate && filter.expirationDate) {
        whereConditions.startDate = {
            [db.Sequelize.Op.gte]: filter.startDate,
        };
        whereConditions.expirationDate = {
            [db.Sequelize.Op.lte]: filter.expirationDate,
        };
    } else if (filter.startDate) {
        whereConditions.startDate = {
            [db.Sequelize.Op.gte]: filter.startDate,
        };
    } else if (filter.expirationDate) {
        whereConditions.expirationDate = {
            [db.Sequelize.Op.lte]: filter.expirationDate,
        };
    }

    if (filter.status) {
        const statusConditions = [];
        if (filter.status === 'UPCOMING') {
            statusConditions.push({
                [db.Sequelize.Op.and]: [
                    db.Sequelize.where(db.Sequelize.fn('DATE', db.Sequelize.col('start_date')), '>', currentDateLocal)
                ]
            });
        } else if (filter.status === 'ACTIVE') {
            statusConditions.push({
                [db.Sequelize.Op.and]: [
                    db.Sequelize.where(db.Sequelize.fn('DATE', db.Sequelize.col('start_date')), '<=', currentDateLocal),
                    db.Sequelize.where(db.Sequelize.fn('DATE', db.Sequelize.col('expiration_date')), '>=', currentDateLocal)
                ]
            });
        } else if (filter.status === 'EXPIRED') {
            statusConditions.push({
                [db.Sequelize.Op.and]: [
                    db.Sequelize.where(db.Sequelize.fn('DATE', db.Sequelize.col('expiration_date')), '<', currentDateLocal)
                ]
            });
        }
        whereConditions[db.Sequelize.Op.or] = statusConditions;
    }

    const totalResults = await db.discountOffer.count({
        where: whereConditions,
    });

    const discounts = await db.discountOffer.findAll({
        where: whereConditions,
        attributes: {
            include: [
                [
                    db.Sequelize.literal(`
                        CASE
                            WHEN DATE(start_date) > DATE('${currentDateLocal}') THEN '${DiscountStatus.UPCOMING}'
                            WHEN DATE(start_date) <= DATE('${currentDateLocal}') AND DATE(expiration_date) >= DATE('${currentDateLocal}') THEN '${DiscountStatus.ACTIVE}'
                            ELSE '${DiscountStatus.EXPIRED}'
                        END
                    `),
                    'status'
                ]
            ]
        },
        raw: true,
        nest: true,
        order: options.sortBy ? [[options.sortBy, options.order || 'ASC']] : [],
        limit: options.limit ? parseInt(options.limit) : undefined,
        offset: options.page ? (parseInt(options.page) - 1) * (options.limit ? parseInt(options.limit) : 10) : undefined,
    });

    const totalPages = Math.ceil(totalResults / (options.limit ? parseInt(options.limit) : 10));

    return {
        results: discounts,
        page: options.page ? parseInt(options.page) : 1,
        limit: options.limit ? parseInt(options.limit) : 10,
        totalPages: totalPages,
        totalResults: totalResults,
    };
};

const revokeDiscount = async (discountId, productId) => {

    const productDiscount = await db.productDiscountOffer.findOne({
        where: {
            productId,
            discountOfferId: discountId
        }
    });

    if (!productDiscount) {
        throw new ApiError(httpStatus.NOT_FOUND, `Discount not found, 
                                                product not found, 
                                                or discount not applied to the product`);
    }

    await db.productDiscountOffer.destroy({
        where: {
            productId,
            discountOfferId: discountId
        }
    });
};

const getAppliedProducts = async (filter, options, exclude = false) => {
    if (!exclude) {
        const { discountId } = filter;
        return await getAllProductsWithDiscount({ id: discountId }, options);
    }

    return await getAllProductsWithoutDiscount(filter, options);
}

export default {
    getDiscountDetail,
    getAllProductsWithDiscount,
    createDiscount,
    editDiscount,
    getAppliedDiscount,
    applyDiscount,
    revokeDiscount,
    getAppliedProducts,
    deleteDiscount,
    getAllDiscounts
}
