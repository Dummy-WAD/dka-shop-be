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

export default {
    createDiscount,
    editDiscount
}
