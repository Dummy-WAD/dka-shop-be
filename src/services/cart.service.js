import httpStatus from 'http-status';
import db from "../models/models/index.js";
import ApiError from '../utils/ApiError.js';
import paginate from './plugins/paginate.plugin.js';
import { DiscountType } from '../utils/enums.js';

const getAllCartItems = async (filter, options) => {

    const productVariantId = filter?.productVariantId ?? null;
    if (productVariantId && !await db.cartItem.findOne({ where: { userId: filter.id, productVariantId } })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    };

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

    const selectedAttributes = [['id', 'cartItemId'], ['quantity', 'orderedQuantity'], 'createdAt'];
    const cartItems = await paginate(db.cartItem, { userId: filter.id, ...(productVariantId && { productVariantId }) }, { ...options, sortBy: 'createdAt', order: 'desc' }, include, [], selectedAttributes);
    const { page, limit, totalPages, totalResults, results } = cartItems;

    const productIds = results.map(item => item.get({ plain: true }).productVariant.productId);

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
        const { cartItemId, productVariant, orderedQuantity } = item.get({ plain: true });
        const { productVariantId, productId, size, color, remainingQuantity, product: { productName, price, productImages } = {} } = productVariant;

        const discountOffer = discountOfferMap[productId]?.discountOffer ?? null;
        const priceDiscounted = discountOffer ?
            discountOffer.discountType === DiscountType.PRICE ?
                Math.max(0, price - discountOffer.discountValue) :
                Math.max(0, price - (price * discountOffer.discountValue / 100)) :
            price;

        return {
            cartItemId,
            productId,
            productVariantId,
            size,
            color,
            orderedQuantity,
            remainingQuantity,
            price: priceDiscounted,
            totalPrice: orderedQuantity * priceDiscounted,
            productName,
            productImage: productImages?.[0]?.imageUrl ?? null
        };
    });

    return productVariantId
        ? formattedResults?.[0]
        : {
            results: formattedResults,
            totalCartItems: totalResults,
            page,
            limit,
            totalPages,
            totalResults
        };
};


const addProductToCart = async (userId, { productVariantId, quantity }) => {

    const productVariant = await db.productVariant.findOne({ where: { id: productVariantId, isDeleted: false } });
    if (!productVariant) throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found');

    const existingCartItem = await db.cartItem.findOne({
        where: { userId, productVariantId }
    });

    if (existingCartItem) {
        const totalQuantity = existingCartItem.quantity + quantity;
        if (totalQuantity > productVariant.quantity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity exceeds available stock');
        };

        existingCartItem.quantity = totalQuantity;
        await existingCartItem.save();
    } else {
        if (quantity > productVariant.quantity) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity exceeds available stock');
        };

        await db.cartItem.create({
            userId,
            productVariantId,
            quantity
        });
    };

    return { totalCartItems: await getTotalCartItemQuantity(userId) };
};

const removeProductFromCart = async (userId, productVariantId) => {

    if (!await db.productVariant.findOne({ where: { id: productVariantId, isDeleted: false } })) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found');
    };

    const existingCartItem = await db.cartItem.findOne({
        where: { userId, productVariantId }
    });

    if (!existingCartItem) throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');

    await existingCartItem.destroy();

    return { totalCartItems: await getTotalCartItemQuantity(userId) };
};

const editCartItemQuantity = async (userId, { productVariantId, quantity, currentPrice }) => {

    const productVariant = await db.productVariant.findOne({ where: { id: productVariantId, isDeleted: false } });
    if (!productVariant) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Product variant not found');
    };

    const existingCartItem = await db.cartItem.findOne({
        where: { userId, productVariantId }
    });

    if (!existingCartItem) throw new ApiError(httpStatus.NOT_FOUND, 'Cart item not found');
    if (quantity > productVariant.quantity) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity exceeds available stock');
    };

    const productDiscountOffer = await db.product.findOne({
        attributes: [['id', 'productId'], 'price'],
        include: [
            {
                model: db.discountOffer,
                attributes: ['discountType', 'discountValue'],
                where: {
                    startDate: { [db.Sequelize.Op.lte]: new Date() },
                    expirationDate: { [db.Sequelize.Op.gte]: new Date() },
                    isDeleted: false,
                },
                required: false,
                through: {
                    model: db.productDiscountOffer,
                    attributes: [],
                    required: false,
                }
            },
            {
                model: db.productVariant,
                attributes: [],
                where: { id: productVariantId }
            }
        ],
        raw: true,
        nest: true
    });

    if (productDiscountOffer) {
        const { price } = productDiscountOffer;
        const discountOffers = productDiscountOffer?.discountOffers ?? null;

        const priceDiscounted = discountOffers ?
            discountOffers.discountType === DiscountType.PRICE ?
                Math.max(0, price - discountOffers.discountValue) :
                Math.max(0, price - (price * discountOffers.discountValue / 100)) :
            price;

        if (priceDiscounted !== currentPrice) throw new ApiError(httpStatus.BAD_REQUEST, 'The price of this product has been updated. Please check the new price')
    };

    existingCartItem.quantity = quantity;
    await existingCartItem.save();
};

const getTotalCartItemQuantity = async (userId) => {
    return await db.cartItem.count({
        where: { userId },
        include: [{
            model: db.productVariant,
            required: true,
            where: { isDeleted: false }
        }]
    });
};

export default {
    getAllCartItems,
    addProductToCart,
    editCartItemQuantity,
    removeProductFromCart,
    getTotalCartItemQuantity
}
