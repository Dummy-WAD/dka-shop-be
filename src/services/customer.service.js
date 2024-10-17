import db from "../models/models/index.js";
import paginate from "./plugins/paginate.plugin.js";
import { UserRole } from "../utils/enums.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const getAllCustomers = async (filter, options) => {
    const searchFields = ['firstName', 'lastName', 'email', 'phoneNumber'];
    const customers = await paginate(db.user, { ...filter, role: UserRole.CUSTOMER }, options, [], searchFields);
    const customerResponse = customers.results.map(customer => {
        const plainCustomer = customer.get({ plain: true });
        delete plainCustomer.password;
        return plainCustomer;
    });
    return {
        ...customers,
        results: customerResponse
    };
};

const getCustomerDetail = async (customerId) => {
    const userInfo = await db.user.findOne({
        where: {
            id: customerId,
            role: 'CUSTOMER',
        },
        attributes: {
            exclude: ['password'],
        }
    });

    if (!userInfo) throw new ApiError(httpStatus.NOT_FOUND, "Customer not found");

    const userAddresses = await db.address.findAll({
        where: {
            customer_id: customerId
        }
    });

    const addresses = userAddresses.map(addr => {
        const parts = [];
        if (addr.local_address) parts.push(addr.local_address);
        if (addr.commune) parts.push(addr.commune);
        if (addr.district) parts.push(addr.district);
        if (addr.province) parts.push(addr.province);
        return {
            full_address: parts.join(', '),
            is_default: addr.is_default,
        };
    });

    return {
        userInfo,
        addresses
    };
};

export default {
    getAllCustomers,
    getCustomerDetail
};
  