import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const getCustomerAddresses = async (customerId) => {
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

    const addresses = userAddresses.map(({ id, localAddress, ward, isDefault }) => ({
        id,
        localAddress: localAddress || null,
        ward: {
            nameEn: ward?.nameEn,
        },
        district: {
            nameEn: ward?.district?.nameEn,
        },
        province: {
            nameEn: ward?.district?.province?.nameEn,
        },
        isDefault,
    }));

    return addresses;
}

const deleteAddress = async (customerId, addressId) => {

    const address = await db.address.findOne({
        where: {
            id: addressId,
            customerId: customerId
        }
    });

    if (!address) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    }

    if (address.isDefault) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete default address');
    }

    await db.address.destroy({
        where: {
            id: addressId
        }
    });
}

export default {
    getCustomerAddresses,
    deleteAddress
};