import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from 'http-status';

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

export default {
    createDiscount,
    editDiscount,
    applyDiscount
}
