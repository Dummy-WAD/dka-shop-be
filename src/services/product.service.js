import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

const getAllProductsByCondition = async (filter, options) => {
    const include = [{
        model: db.productImage,
        required: false,
        attributes: [['image_url', 'image']],
        where: {
            is_primary: true,
        },
    }];
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

export default { getAllProductsByCondition, deleteProduct, getProductDetail };
