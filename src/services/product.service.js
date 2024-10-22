import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { DiscountType, DeleteStatus } from '../utils/enums.js';

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

const createProduct = async (productBody) => {
    const product = await db.product.findOne({ 
        where: { 
            name: productBody.name,
            is_deleted: DeleteStatus.NOT_DELETED
        } 
    });

    if (product) throw new ApiError(httpStatus.BAD_REQUEST, 'Product already exists!');
    
    const category = await db.category.findOne({
        where: { id: productBody.categoryId, is_deleted: DeleteStatus.NOT_DELETED }
    });

    if (!category) throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found!');

    // Create product
    const newProduct = await db.product.create({
        name: productBody.name,
        price: productBody.price,
        description: productBody.description,
        categoryId: category.id,
        isDeleted: DeleteStatus.NOT_DELETED,
    });

    // Create product images
    if (productBody.productImages && productBody.productImages.length > 0) {
        const images = productBody.productImages.map(image => ({
            productId: newProduct.id,
            imageUrl: `${process.env.AWS_CLOUDFRONT_URL}/${image.filename}`,
            isPrimary: image.isPrimary,
        }));
        await db.productImage.bulkCreate(images);
    }

    // Create product variants
    if (productBody.productVariants && productBody.productVariants.length > 0) {
        const variants = productBody.productVariants.map(variant => ({
            productId: newProduct.id,
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity,
            isDeleted: DeleteStatus.NOT_DELETED,
        }));
        await db.productVariant.bulkCreate(variants);
    }

    // return created product with images and variants
    return {status: 'success', message: 'Product created successfully!'};
}

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

    const { productImages, isDeleted, categoryId, category, ...basicInfo } = productDetail.get();

    const primaryImage = productDetail.productImages.find(img => img.isPrimary)?.imageUrl || null;
    const otherImages = productDetail.productImages.filter(img => !img.isPrimary).map(img => img?.imageUrl || null);

    return {
        ...basicInfo,
        categoryName: category?.name ?? null,
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


export default { getAllProductsByCondition, createProduct, deleteProduct, getProductDetail, getProductDetailForCustomer };
