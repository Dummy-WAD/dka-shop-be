import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';

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

export default { getAllProductsByCondition };
