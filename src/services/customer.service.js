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
            customerId: customerId
        },
        include: [
            {
                model: db.ward,
                as: 'ward',
                attributes: ['nameEn'],
                include: [
                    {
                        model: db.district,
                        as: 'district',
                        attributes: ['nameEn'],
                        include: [
                            {
                                model: db.province,
                                as: 'province',
                                attributes: ['nameEn']
                            }
                        ]
                    }
                ]
            }
        ],
        order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']]
    });

    console.log(userAddresses);

    const addresses = userAddresses.map(addr => {
        const parts = [];
        if (addr.localAddress) parts.push(addr.localAddress);
        if (addr.ward) {
            parts.push(addr.ward.nameEn);
            parts.push(addr.ward.district.nameEn);
            parts.push(addr.ward.district.province.nameEn);
        }
        return {
            fullAddress: parts.join(', '),
            isDefault: addr.isDefault,
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
  