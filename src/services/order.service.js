import paginate from './plugins/paginate.plugin.js';
import db from '../models/models/index.js';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError.js';

const getOrdersByCustomer = async (filter, options, id) => {
    const customer = await db.user.findOne({
        where: {
            id: id.customerId,
            role: 'CUSTOMER'
        }
    });
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found!');
    const selectedAttributes = ['id', 'ordered_at', 'total', 'delivery_fee', 'status', 'createdAt', 'updatedAt'];
    return await paginate(db.order, { ...filter, customer_id: id.customerId }, options, [], [], selectedAttributes);
};

export default { 
    getOrdersByCustomer 
};
