import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { DiscountType } from '../utils/enums.js';

const getAllProductsByCondition = async (filter, options) => {
    const include = [
        {
            model: db.category,
            required: false,
            attributes: ['id', 'name'],
            where: { is_deleted: false },
        },
        {
            model: db.productImage,
            required: false,
            attributes: [['image_url', 'image']],
            where: {
                is_primary: true,
            },
        }
    ];
    return await paginate(db.product, filter, options, include);
};

const deleteProduct = async (productId) => {
    const product = await db.product.findByPk(productId);
    
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');
    if (product.isDeleted) throw new ApiError(httpStatus.BAD_REQUEST, 'Product already deleted!');
    
    product.isDeleted = true;
    await product.save();
};

const getProductDetail = async (productId) => {
    const productDetail = await db.product.findOne({
        where: { id: productId, isDeleted: false },
        include: [
            {
                model: db.category,
                attributes: ['id', 'name'],
                where: { is_deleted: false },
                required: false
            },
            {
                model: db.productImage,
                attributes: ['imageUrl', 'isPrimary'],
                required: false
            },
            {
                model: db.productVariant,
                where: { isDeleted: false },
                attributes: ['size', 'color', 'quantity', 'isDeleted'],
                required: false
            }
        ],
    });

    if (!productDetail) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');

    const { productImages, isDeleted, categoryId, ...basicInfo } = productDetail.get();

    const primaryImage = productDetail.productImages.find(img => img.isPrimary)?.imageUrl || null;
    const otherImages = productDetail.productImages.filter(img => !img.isPrimary).map(img => img?.imageUrl || null);

    return {
        ...basicInfo,
        primaryImage,
        otherImages
    };
};


const getProductDetailForCustomer = async (productId) => {
    const productDetail = await db.product.findOne({
        where: { id: productId, isDeleted: false },
        include: [
            {
                model: db.category,
                attributes: ['id', 'name'],
                where: { is_deleted: false },
                required: false
            },
            {
                model: db.productImage,
                attributes: ['imageUrl', 'isPrimary'],
                required: false
            },
            {
                model: db.productVariant,
                where: { isDeleted: false },
                attributes: ['size', 'color', 'quantity'],
                required: false
            },
            {
                model: db.discountOffer,
                required: false,
                attributes: {
                    include: [
                        [
                            db.sequelize.literal(`CASE 
                                WHEN NOW() BETWEEN \`discountOffers\`.\`start_date\` AND \`discountOffers\`.\`expiration_date\`
                                AND \`discountOffers\`.\`discount_type\` = '${DiscountType.PRICE}' THEN \`product\`.\`price\` - \`discountOffers\`.\`discount_value\`
                                WHEN NOW() BETWEEN \`discountOffers\`.\`start_date\` AND \`discountOffers\`.\`expiration_date\`
                                AND \`discountOffers\`.\`discount_type\` = '${DiscountType.PERCENTAGE}' THEN \`product\`.\`price\` - (\`product\`.\`price\` * \`discountOffers\`.\`discount_value\` / 100)
                                ELSE \`product\`.\`price\`
                            END`),
                            'priceDiscounted'
                        ]
                    ],
                    exclude: ['createdAt', 'updatedAt', 'isDeleted', 'startDate', 'expirationDate']
                },
                through: {
                    model: db.productDiscountOffer,
                    attributes: []
                },
                where: { isDeleted: false }
            }
        ],
    });

    if (!productDetail) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');

    const productPlain = productDetail.get({ plain: true });

    const { productImages, isDeleted, categoryId, category, discountOffers, ...basicInfo } = productPlain;
    const priceDiscounted = productPlain.discountOffers[0]?.priceDiscounted || basicInfo.price;
    
    const primaryImage = productPlain.productImages.find(img => img.isPrimary)?.imageUrl || null;
    const otherImages = productPlain.productImages.filter(img => !img.isPrimary).map(img => img?.imageUrl || null);

    return {
        ...basicInfo,
        categoryName: category?.name ?? null,
        priceDiscounted,
        primaryImage,
        otherImages
    };
};


export default { getAllProductsByCondition, deleteProduct, getProductDetail, getProductDetailForCustomer };
