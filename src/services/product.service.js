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

export default { getAllProductsByCondition, deleteProduct };
