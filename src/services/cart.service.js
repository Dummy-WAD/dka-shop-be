import httpStatus from 'http-status';
import db from "../models/models/index.js";
import ApiError from '../utils/ApiError.js';
import paginate from './plugins/paginate.plugin.js';
import { DiscountType, UserRole } from '../utils/enums.js';

const getAllCartItems = async (filter, options) => {
    const customer = await db.user.findOne({ where: { id: filter.id, role: UserRole.CUSTOMER } });
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');

    const include = [
        {
            model: db.productVariant,
            attributes: [['id', 'productVariantId'], 'productId', 'size', 'color', ['quantity', 'remainingQuantity']],
            where: { isDeleted: false },
            include: {
                model: db.product,
                attributes: [['name', 'productName'], 'price'],
                where: { isDeleted: false },
                include: {
                    model: db.productImage,
                    attributes: ['imageUrl'],
                    where: { isPrimary: true }
                }
            }
        }
    ];

    const selectedAttributes = [['quantity', 'orderedQuantity'], 'createdAt'];
    const cartItems = await paginate(db.cartItem, { userId: filter.id }, { ...options, sortBy: 'createdAt', order: 'desc' }, include, [], selectedAttributes);
    const { page, limit, totalPages, totalResults, results } = cartItems;

    const productIds = results.map(item => item.get({plain: true}).productVariant.productId);

    const discountOffers = await db.productDiscountOffer.findAll({
        attributes: ['productId'],
        where: { productId: [...new Set(productIds)] },
        include: [
            {
                model: db.discountOffer,
                where: {
                    startDate: { [db.Sequelize.Op.lte]: new Date() },
                    expirationDate: { [db.Sequelize.Op.gte]: new Date() },
                    isDeleted: false,
                },
            }
        ],
        raw: true,
        nest: true
    });

    const discountOfferMap = {};
    discountOffers.forEach(offer => {
        discountOfferMap[offer.productId] = offer;
    });

    const formattedResults = results.map(item => {
        const { productVariant, orderedQuantity } = item.get({ plain: true });
        const { productVariantId, productId, size, color, remainingQuantity, product: { productName, price, productImages } = {} } = productVariant;

        const discountOffer = discountOfferMap[productId]?.discountOffer ?? null;
        const priceDiscounted = discountOffer ?
            discountOffer.discountType === DiscountType.PRICE ?
                price - discountOffer.discountValue :
                price - (price * discountOffer.discountValue / 100) :
            price;

        return {
            productId,
            productVariantId,
            size,
            color,
            orderedQuantity,
            remainingQuantity,
            price: price === priceDiscounted ? price : priceDiscounted,
            totalPrice: orderedQuantity * priceDiscounted,
            productName,
            productImage: productImages?.[0]?.imageUrl ?? null
        };
    });

    return { results: formattedResults, totalCartItems: totalResults, page, limit, totalPages, totalResults };
};

export default {
    getAllCartItems,
}
