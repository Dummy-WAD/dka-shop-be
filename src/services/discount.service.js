import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from 'http-status';
import paginate from './plugins/paginate.plugin.js';
import { DiscountStatus } from "../utils/enums.js";

const getDiscountDetail = async (discountId) => {
    const currentDate = new Date(new Date().getTime() + (7 * 60 * 60 * 1000));

    const discount = await db.discountOffer.findOne({
        where: { id: discountId, isDeleted: false },
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'isDeleted'],
            include: [
                [
                    db.Sequelize.literal(`
                        CASE
                            WHEN start_date > '${currentDate.toISOString()}' THEN '${DiscountStatus.UPCOMING}'
                            WHEN start_date <= '${currentDate.toISOString()}' AND expiration_date >= '${currentDate.toISOString()}' THEN '${DiscountStatus.ACTIVE}'
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
    const include = [
        {
            model: db.category,
            attributes: ['id', 'name']
        },
        {
            model: db.discountOffer,
            attributes: [[
                db.sequelize.literal(`
                    CASE 
                        WHEN CURDATE() BETWEEN DATE(start_date) AND DATE(expiration_date)
                        AND discount_type = 'PRICE' THEN 
                            CASE 
                                WHEN discount_value >= product.originPrice THEN 0
                                ELSE product.originPrice - discount_value
                            END
                        WHEN CURDATE() BETWEEN DATE(start_date) AND DATE(expiration_date)
                        AND discount_type = 'PERCENTAGE' THEN product.originPrice - (product.originPrice * discount_value / 100)
                        ELSE product.originPrice
                    END
                `),
                'priceDiscounted'
            ]],
            where: { ...filter, isDeleted: false }
        }
    ];

    const selectedAttributes = [['id', 'productId'], ['name', 'productName'], ['price', 'originPrice']];

    const productDiscountOffers = await paginate(db.product, { isDeleted: false }, options, include, [], selectedAttributes);
    const plainResults = productDiscountOffers.results.map(item => item.get({ plain: true }));

     const products = plainResults.map(product => ({
        ...product,
        categoryName: product.category.name,
        categoryId: product.category.id,
        priceDiscounted: product.discountOffers[0]?.priceDiscounted,
        discountOffers: undefined,
        category: undefined
    }));

    return {
        ...productDiscountOffers,
        results: products
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

    const isValidStartDate = (date) => new Date(date) >= currentDate;
    const isValidExpirationDate = (date) => new Date(date) >= currentDate;
    const isValidExpirationAfterStartDate = (startDate, expirationDate) => new Date(expirationDate) >= new Date(startDate);
    const normalizeDate = (date) => date ? new Date(date).toISOString().split('T')[0] : null;

    if (!(normalizeDate(payload?.startDate) == normalizeDate(discount.startDate) && normalizeDate(payload?.expirationDate) == normalizeDate(discount.expirationDate))) {
        if (payload?.startDate && !isValidStartDate(payload.startDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Start Date must be greater than or equal to Current Date');
        }

        if (payload?.expirationDate && !isValidExpirationDate(payload.expirationDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Expiration Date must be greater than or equal to Current Date');
        }

        if (!isValidExpirationAfterStartDate(startDate, expirationDate)) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Expiration Date must be greater than or equal to Start Date');
        }
    };

    await db.discountOffer.update(payload, { where: { id: discountId } });
};

const applyDiscount = async (discountId, productIds, isConfirmed = false) => {
    const transaction = await db.sequelize.transaction();

    try {
        const discount = await db.discountOffer.findOne({
            where: { id: discountId, isDeleted: false },
            transaction
        });

        if (!discount) {
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
        const expirationDate = new Date(discount.expirationDate).setHours(0, 0, 0, 0);

        if (currentDate > expirationDate) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Discount has expired');
        }

        const existingDiscount = await db.productDiscountOffer.findAll({
            where: {
                productId: productIds
            },
            include: {
                model: db.discountOffer,
                where: {
                    startDate: { [db.Sequelize.Op.lte]: currentDate },
                    expirationDate: { [db.Sequelize.Op.gte]: currentDate },
                    isDeleted: false
                }
            },
            transaction
        });

        if (existingDiscount.length > 0 && !isConfirmed) {
            throw new ApiError(httpStatus.CONFLICT, 'Discount already applied to one or more products.');
        }

        if (existingDiscount.length > 0) {
            await db.productDiscountOffer.destroy({
                where: {
                    productId: existingDiscount.map(item => item.productId),
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
    const products = await db.productDiscountOffer.findAll({ where: { discountOfferId: discountId } });
    if (products.length > 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Discount is being used by one or more products');
    }

    // check if discount has started
    if (discount.startDate <= new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete discount that has started');
    }

    await db.discountOffer.update({ isDeleted: true }, { where: { id: discountId } });
}

export default {
    getDiscountDetail,
    getAllProductsWithDiscount,
    createDiscount,
    editDiscount,
    applyDiscount,
    deleteDiscount
}
