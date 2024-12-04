import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import { DeleteStatus } from '../utils/enums.js';
import { Op } from 'sequelize';

const DISCOUNTED_PRICE_CALCULATION = {
    model: db.discountOffer,
    required: false,
    attributes: [
        [
            db.sequelize.literal(`CASE 
                WHEN CURDATE() BETWEEN DATE(discountOffers.start_date) AND DATE(discountOffers.expiration_date)
                AND discountOffers.discount_type = 'PRICE' THEN
                    CASE
                        WHEN discountOffers.discount_value >= product.price THEN 0
                        ELSE product.price - discountOffers.discount_value
                    END
                WHEN CURDATE() BETWEEN DATE(discountOffers.start_date) AND DATE(discountOffers.expiration_date)
                AND discountOffers.discount_type = 'PERCENTAGE' THEN product.price - (product.price * discountOffers.discount_value / 100)
                ELSE product.price
            END`),
            'priceDiscounted'
        ]
    ],
    where: { 
        isDeleted: false,
        start_date: { [Op.lte]: db.sequelize.fn('CURDATE') },
        expiration_date: { [Op.gte]: db.sequelize.fn('CURDATE') }
    },
};

const RATING_CALCULATION = async (product_id) => {
    const q = `
    SELECT AVG(r.rating) AS average_rating 
    FROM dka_shop.reviews AS r
    INNER JOIN order_items AS oi ON oi.id = r.order_item_id
    INNER JOIN product_variants AS pv ON pv.id = oi.product_variant_id
    INNER JOIN products AS p ON p.id = pv.product_id
    WHERE p.id = ${product_id}`;
    const result = await db.sequelize.query(q, { type: db.sequelize.QueryTypes.SELECT });
    if (result[0].average_rating === null) return 0;
    return parseFloat(result[0].average_rating);
}

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
        },
        { ...DISCOUNTED_PRICE_CALCULATION }
    ];
    const products = await paginate(db.product, filter, options, include);

    const results = products.results.map(product => {
        const productData = product.get({ plain: true });
        return {
            ...productData,
            currentPrice: productData.discountOffers?.[0]?.priceDiscounted ?? productData.price,
            discountOffers: undefined
        };
    });
    
    return {
        ...products,
        results,
    };
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
    const transaction = await db.sequelize.transaction();
    try {
        const product = await db.product.findByPk(productId, { transaction });
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');
        if (product.isDeleted) throw new ApiError(httpStatus.BAD_REQUEST, 'Product already deleted!');
        
        // Update product name
        if (productBody.name) {
            const existingProduct = await db.product.findOne({
                where: { name: productBody.name, isDeleted: DeleteStatus.NOT_DELETED },
                transaction
            });
            if (existingProduct && existingProduct.id !== productId) throw new ApiError(httpStatus.BAD_REQUEST, 'Product name already exists!');
            product.name = productBody.name;
        }

        // Update category
        if (productBody.categoryId) {
            const category = await db.category.findOne({
                where: { id: productBody.categoryId, is_deleted: DeleteStatus.NOT_DELETED },
                transaction
            });
            if (!category) throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found!');
            product.categoryId = productBody.categoryId;
        }

        // Update price and description
        if (productBody.price) product.price = productBody.price;
        if (productBody.description) product.description = productBody.description;
        await product.save({ transaction });

        // Update product images
        if (productBody.productImages && productBody.productImages.length > 0) {
            const all_images = await db.productImage.findAll({ where: { productId }, transaction });
            await db.productImage.update(
                { isPrimary: false },
                { where: { productId, isPrimary: true }, transaction }
            );

            // check new images
            const request_images = productBody.productImages.map(image => image.filename);  
            const current_images = all_images.map(image => image.imageUrl.split('/').pop());
            const new_images = request_images.filter(image => !current_images.includes(image));
            const delete_images = current_images.filter(image => !request_images.includes(image));
            
            // delete images
            const delete_images_id = all_images.filter(image => delete_images.includes(image.imageUrl.split('/').pop())).map(image => image.id);
            await db.productImage.destroy({ where: { id: delete_images_id }, transaction });

            // create new images
            const images = new_images.map(image => ({
                productId,
                imageUrl: `${process.env.AWS_CLOUDFRONT_URL}/${image}`,
                isPrimary: false,
            }));

            await db.productImage.bulkCreate(images, { transaction });

            // update primary image
            const primary_image = productBody.productImages.find(image => image.isPrimary);
            if (primary_image) {
                const primary_image_db = await db.productImage.findOne({ where: { productId, imageUrl: `${process.env.AWS_CLOUDFRONT_URL}/${primary_image.filename}` }, transaction });
                primary_image_db.isPrimary = true;
                await primary_image_db.save({ transaction });
            } else {
                throw new ApiError(httpStatus.BAD_REQUEST, 'One and only one image must have isPrimary set to true');
            }
        }

        // Update product variants
        if (productBody.productVariants && productBody.productVariants.length > 0) {
            const all_variants = await db.productVariant.findAll({ where: { productId, isDeleted: DeleteStatus.NOT_DELETED }, transaction });
            
            const request_variants = productBody.productVariants.map(variant => variant.id);
            const current_variants = all_variants.map(variant => variant.id);

            const new_variants = productBody.productVariants.filter(variant => variant.id === null);
            const delete_variants = current_variants.filter(variant => !request_variants.includes(variant));
            const update_variants = current_variants.filter(variant => !delete_variants.includes(variant));

            // IT IS IMPORTANT TO CHECK THE QUANTITY OF THE VARIANT BEFORE UPDATING ON THE DEBUG MODE
            // console.log('request_variants', request_variants);
            // console.log('current_variants', current_variants);
            // console.log('new_variants', new_variants);
            // console.log('delete_variants', delete_variants);
            // console.log('update_variants', update_variants);

            // delete variants
            await db.productVariant.update(
                { isDeleted: DeleteStatus.DELETED },
                { where: { id: delete_variants }, transaction }
            );

            // create new variants
            const variants = new_variants.map(variant => ({
                productId,
                size: variant.size,
                color: variant.color,
                quantity: variant.quantity,
                isDeleted: DeleteStatus.NOT_DELETED,
            }));
            await db.productVariant.bulkCreate(variants, { transaction });

            // update variants
            const updatePromises = update_variants.map(async variant => {
                const request_variant = productBody.productVariants.find(v => v.id === variant);
                const current_variant = await db.productVariant.findByPk(variant, { transaction });
                current_variant.size = request_variant.size;
                current_variant.color = request_variant.color;
                current_variant.is_deleted = DeleteStatus.NOT_DELETED;

                // update quantity
                if (request_variant.changeValue > 0) {
                    current_variant.quantity += request_variant.changeValue;
                }

                if (request_variant.changeValue < 0) {
                    if (current_variant.quantity + request_variant.changeValue < 0) {
                        throw new ApiError(httpStatus.BAD_REQUEST, 'Quantity must be greater than or equal to 0');
                    }
                    current_variant.quantity += request_variant.changeValue;
                }

                await current_variant.save({ transaction });
            });

            await Promise.all(updatePromises);
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteProduct = async (productId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const product = await db.product.findByPk(productId, { transaction });
        
        if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');
        if (product.isDeleted) throw new ApiError(httpStatus.BAD_REQUEST, 'Product already deleted!');

        await product.update({ isDeleted: true }, { transaction });
        
        await db.productVariant.update(
            { isDeleted: true },
            { where: { productId }, transaction }
        );

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
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
                attributes: ['id', 'size', 'color', 'quantity', 'isDeleted'],
                required: false
            },
            { ...DISCOUNTED_PRICE_CALCULATION }
        ]
    });

    if (!productDetail) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');
    
    const productPlain = productDetail.get({ plain: true });
    const { productImages, isDeleted, categoryId, discountOffers, ...basicInfo } = productPlain;
    const currentPrice = productPlain.discountOffers[0]?.priceDiscounted ?? basicInfo.price;

    const { primaryImage, otherImages } = separateProductImages(productImages);
    const averageRating = await RATING_CALCULATION(productId);
    return {
        ...basicInfo,
        averageRating,
        currentPrice,
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
                attributes: ['id', 'size', 'color', 'quantity'],
                required: false
            },
            { ...DISCOUNTED_PRICE_CALCULATION }
        ],
    });

    if (!productDetail) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found!');

    const productPlain = productDetail.get({ plain: true });

    const { productImages, isDeleted, categoryId, category, discountOffers, ...basicInfo } = productPlain;
    const priceDiscounted = productPlain.discountOffers[0]?.priceDiscounted ?? basicInfo.price;

    const { primaryImage, otherImages } = separateProductImages(productImages);
    const averageRating = await RATING_CALCULATION(productId);

    return {
        ...basicInfo,
        averageRating,
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
            { ...DISCOUNTED_PRICE_CALCULATION }
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

    // add average rating
    const paginatedProductsWithRating = await Promise.all(paginatedProducts.map(async product => {
        const averageRating = await RATING_CALCULATION(product.id);
        return { ...product, averageRating };
    }));

    const totalResults = filteredProducts.length;
    const totalPages = Math.ceil(totalResults / limit);

    return {
        results: paginatedProductsWithRating,
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
            { ...DISCOUNTED_PRICE_CALCULATION }
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

    // add average rating
    const bestSellingProductsWithRating = await Promise.all(bestSellingProducts.map(async product => {
        const averageRating = await RATING_CALCULATION(product.id);
        return { ...product, averageRating };
    }));


    return bestSellingProductsWithRating.map(product => {
        const { discountOffers, productImages, ...basicInfo } = product;
        return {
            ...basicInfo,
            priceDiscounted: discountOffers?.priceDiscounted ?? basicInfo.price,
            imageUrl: productImages.imageUrl
        };
    });
};

const getDiscountedPriceOfProducts = async (productIds) => {
    const discountedPrices = await db.product.findAll({
        attributes: ['id'],
        where: { id: productIds },
        include: { ...DISCOUNTED_PRICE_CALCULATION },
        raw: true,
        nest: true
    });

    return discountedPrices.reduce((prices, product) => {
        prices[product.id] = product.discountOffers?.priceDiscounted || product.price;
        return prices;
    }, {});
}

export default { 
    getAllProductsByCondition,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetail,
    getProductDetailForCustomer,
    getProductsForCustomer,
    getBestSellerProducts,
    getDiscountedPriceOfProducts
};
