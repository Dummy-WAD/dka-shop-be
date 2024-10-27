import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { DiscountType, DeleteStatus } from '../utils/enums.js';
import { Op } from 'sequelize';

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
}

const updateProduct = async (productId, productBody) => {
    const product = await db.product.findByPk(productId);
    if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');
    if (product.isDeleted) throw new ApiError(httpStatus.BAD_REQUEST, 'Product already deleted!');

    if (productBody.name) {
        const existingProduct = await db.product.findOne({
            where: { name: productBody.name, isDeleted: DeleteStatus.NOT_DELETED }
        });
        if (existingProduct && existingProduct.id !== productId) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Product name already exists!');
        }
    }

    if (productBody.categoryId) {
        const category = await db.category.findOne({
            where: { id: productBody.categoryId, is_deleted: DeleteStatus.NOT_DELETED }
        });
        if (!category) throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found!');
    }

    // Update product
    product.name = productBody.name;
    product.price = productBody.price;
    product.description = productBody.description;
    product.categoryId = productBody.categoryId;
    await product.save();
    // Update product images
    if (productBody.productImages && productBody.productImages.length > 0) {
        const all_images = await db.productImage.findAll({ where: { productId } });
        await db.productImage.update(
            { isPrimary: false },
            { where: { productId, isPrimary: true } }
        );

        // check new images
        const request_images = productBody.productImages.map(image => image.filename);  
        const current_images = all_images.map(image => image.imageUrl.split('/').pop());
        const new_images = request_images.filter(image => !current_images.includes(image));
        const delete_images = current_images.filter(image => !request_images.includes(image));
        
        // console.log('request_images', request_images);
        // console.log('current_images', current_images);
        // console.log('new_images', new_images);
        // console.log('delete_images', delete_images);
        
        // delete images
        const delete_images_id = all_images.filter(image => delete_images.includes(image.imageUrl.split('/').pop())).map(image => image.id);
        // console.log('delete_images_id', delete_images_id);
        await db.productImage.destroy({ where: { id: delete_images_id } });

        // create new images
        const images = new_images.map(image => ({
            productId,
            imageUrl: `${process.env.AWS_CLOUDFRONT_URL}/${image}`,
            isPrimary: false,
        }));

        await db.productImage.bulkCreate(images);

        // update primary image
        const primary_image = productBody.productImages.find(image => image.isPrimary);
        if (primary_image) {
            const primary_image_db = await db.productImage.findOne({ where: { productId, imageUrl: `${process.env.AWS_CLOUDFRONT_URL}/${primary_image.filename}` } });
            primary_image_db.isPrimary = true;
            await primary_image_db.save();
        } else {
            throw new ApiError(httpStatus.BAD_REQUEST, 'One and only one image must have isPrimary set to true');
        }
    }

    // Update product variants
    if (productBody.productVariants && productBody.productVariants.length > 0) {
        
        const all_variants = await db.productVariant.findAll({ where: { productId } });
        const request_variants = productBody.productVariants.map(variant => `${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`);
        const current_variants = all_variants.map(variant => `${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`);
        const new_variants = request_variants.filter(variant => !current_variants.includes(variant));
        const delete_variants = current_variants.filter(variant => !request_variants.includes(variant));
        const update_variants = request_variants.filter(variant => current_variants.includes(variant));

        // console.log('request_variants', request_variants);
        // console.log('current_variants', current_variants);
        // console.log('new_variants', new_variants);
        // console.log('delete_variants', delete_variants);
        // console.log('update_variants', update_variants);

        // delete variants
        const delete_variants_id = all_variants.filter(variant => delete_variants.includes(`${variant.size.toLowerCase()}-${variant.color.toLowerCase()}`)).map(variant => variant.id);
        await db.productVariant.update(
            { isDeleted: DeleteStatus.DELETED },
            { where: { id: delete_variants_id } }
        );

        // create new variants
        const variants = new_variants.map(variant => {
            const [size, color] = variant.split('-');
            return {
                productId,
                size,
                color,
                quantity: productBody.productVariants.find(v => `${v.size.toLowerCase()}-${v.color.toLowerCase()}` === variant).quantity,
                isDeleted: DeleteStatus.NOT_DELETED,
            };
        });

        await db.productVariant.bulkCreate(variants);

        // update variants
        for (const variant of update_variants) {
            const [size, color] = variant.split('-');
            const variant_db = await db.productVariant.findOne({ where: { productId, size, color } });
            variant_db.quantity = productBody.productVariants.find(v => `${v.size.toLowerCase()}-${v.color.toLowerCase()}` === variant).quantity;
            await variant_db.save();
        }
    }
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

    const { primaryImage, otherImages } = separateProductImages(productImages);

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

    const { primaryImage, otherImages } = separateProductImages(productImages);

    return {
        ...basicInfo,
        categoryName: category?.name ?? null,
        priceDiscounted,
        primaryImage,
        otherImages
    };
};

const separateProductImages = (productImages) => {
    const primaryImageUrl = productImages.find(img => img.isPrimary)?.imageUrl || null;

    const primaryImage = primaryImageUrl ? {
        url: primaryImageUrl,
        filename: (new URL(primaryImageUrl)).pathname.slice(1)
    } : null;

    const otherImages = productImages
        .filter(img => !img.isPrimary)
        .map(img => ({
            url: img.imageUrl || null,
            filename: img ? (new URL(img.imageUrl)).pathname.slice(1) : null
        }));

    return { primaryImage, otherImages };
}

const getProductsForCustomer = async (filter, search, options) => {
    const { categoryId, priceStart, priceEnd } = filter;
    const { name } = search;
    const { sortBy, order, limit, page } = options;

    const where = {
        isDeleted: false,
    };
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (name) {
        where.name = {
            [Op.like]: `%${name}%`
        };
    }

    const products = await db.product.findAndCountAll({
        where,
        include: [
            {
                model: db.productImage,
                as: 'productImages',
                attributes: ['imageUrl'],
                where: { isPrimary: true },
                required: false
            },
            {
                model: db.discountOffer,
                through: { attributes: [] },
                required: false,
                attributes: {
                    include: [
                        [
                            db.sequelize.literal(`CASE 
                                WHEN NOW() BETWEEN discountOffers.start_date AND discountOffers.expiration_date
                                AND discountOffers.discount_type = 'PRICE' THEN product.price - discountOffers.discount_value
                                WHEN NOW() BETWEEN discountOffers.start_date AND discountOffers.expiration_date
                                AND discountOffers.discount_type = 'PERCENTAGE' THEN product.price - (product.price * discountOffers.discount_value / 100)
                                ELSE product.price
                            END`),
                            'priceDiscounted'
                        ]
                    ],
                    exclude: ['createdAt', 'updatedAt', 'isDeleted', 'startDate', 'expirationDate']
                },
                where: { isDeleted: false }
            }
        ]
    });

    const formattedProducts = products.rows.map(product => {
        const productPlain = product.get({ plain: true });
        const { productImages, discountOffers, ...basicInfo } = productPlain;
        const primaryImageUrl = productImages.length > 0 ? productImages[0].imageUrl : null;
        const priceDiscounted = discountOffers.length > 0 
            ? discountOffers[0].priceDiscounted 
            : basicInfo.price;
        return {
            ...basicInfo,
            primaryImageUrl,
            priceDiscounted
        };
    });

    const filteredProducts = formattedProducts.filter(product => {
        const price = parseFloat(product.priceDiscounted);
        return (priceStart === undefined || price >= priceStart) && 
               (priceEnd === undefined || price <= priceEnd);
    });

    const sortedProducts = filteredProducts.sort((a, b) => {
        const aValue = sortBy === 'price' ? parseFloat(a.priceDiscounted) : sortBy === 'updatedAt' ? new Date(a[sortBy]) : a[sortBy];
        const bValue = sortBy === 'price' ? parseFloat(b.priceDiscounted) : sortBy === 'updatedAt' ? new Date(b[sortBy]) : b[sortBy];
        return order === 'desc' ? bValue - aValue : aValue - bValue;
    });

    const paginatedProducts = sortedProducts.slice((page - 1) * limit, page * limit);
    const totalResults = filteredProducts.length;
    const totalPages = Math.ceil(totalResults / limit);

    return {
        results: paginatedProducts,
        page,
        limit,
        totalPages,
        totalResults,
    };
};

async function getBestSellerProducts(bestSellerRequest) {
    const { categoryId, limit } = bestSellerRequest;

    if (categoryId && !await db.category.findOne({ where: { id: categoryId, is_deleted: false }})) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');

    const bestSellingProducts = await db.product.findAll({
        attributes: ['id', 'name', 'price'],
        include: [
            {
                model: db.productImage,
                attributes: ['imageUrl'],
                where: { isPrimary: true },
                required: false
            },
            {
                model: db.discountOffer,
                through: { attributes: [] },
                required: false,
                attributes: {
                    include: [
                        [
                            db.sequelize.literal(`CASE 
                                WHEN NOW() BETWEEN discountOffers.start_date AND discountOffers.expiration_date
                                AND discountOffers.discount_type = 'PRICE' THEN product.price - discountOffers.discount_value
                                WHEN NOW() BETWEEN discountOffers.start_date AND discountOffers.expiration_date
                                AND discountOffers.discount_type = 'PERCENTAGE' THEN product.price - (product.price * discountOffers.discount_value / 100)
                                ELSE product.price
                            END`),
                            'priceDiscounted'
                        ]
                    ],
                    exclude: ['createdAt', 'updatedAt', 'isDeleted', 'startDate', 'expirationDate']
                },
                where: { isDeleted: false }
            }
        ],
        where: { isDeleted: false, ...(categoryId ? { categoryId } : {}) },
        order: [[db.sequelize.literal(`
            (SELECT SUM(order_items.quantity) 
             FROM order_items 
             JOIN product_variants ON order_items.product_variant_id = product_variants.id 
             WHERE product_variants.product_id = product.id)
        `), 'DESC']],
        limit: limit,
        raw: true,
        nest: true
    });

    return bestSellingProducts.map(product => {
        const { discountOffers, productImages, ...basicInfo } = product;
        return {
            ...basicInfo,
            priceDiscounted: discountOffers?.priceDiscounted ?? basicInfo.price,
            imageUrl: productImages.imageUrl
        };
    });
};

export default { 
    getAllProductsByCondition,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetail,
    getProductDetailForCustomer,
    getProductsForCustomer,
    getBestSellerProducts
};
