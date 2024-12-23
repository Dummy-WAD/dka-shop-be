import db from "../models/models/index.js";
import ApiError from "../utils/ApiError.js";
import httpStatus from "http-status";

const LIMIT_ADDRESS_COUNT = 10;

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

    const addresses = userAddresses.map(({ id, phoneNumber, contactName, localAddress, ward, isDefault }) => ({
        id,
        phoneNumber: phoneNumber || null,
        contactName: contactName || null,
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

const getAddressDetails = async (customerId, addressId) => {
    const address = await db.address.findOne({
        where: {
            id: addressId,
            customerId: customerId
        },
        include: [
            {
                model: db.ward,
                as: 'ward',
                attributes: ['nameEn', 'districtId'],
                include: [
                    {
                        model: db.district,
                        as: 'district',
                        attributes: ['nameEn', 'provinceId'],
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
        ]
    });

    if (!address) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    }

    const addressDetails = {
        id: address.id,
        phoneNumber: address.phoneNumber || null,
        contactName: address.contactName || null,
        localAddress: address.localAddress || null,
        ward: {
            id: address.wardId,
            nameEn: address.ward?.nameEn,
        },
        district: {
            id: address.ward?.districtId,
            nameEn: address.ward?.district?.nameEn,
        },
        province: {
            id: address.ward?.district?.provinceId,
            nameEn: address.ward?.district?.province?.nameEn,
        },
        isDefault: address.isDefault,
    };

    return addressDetails;
}

const createAddress = async (customerId, addressDetails) => {
    const ward = await db.ward.findOne({
        where: {
            id: addressDetails.wardId
        },
        attributes: ['id']
    });

    if (!ward) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Ward not found');
    }

    const addrCount = await db.address.count({
        where: {
            customerId: customerId
        }
    });

    // Limit address count to LIMIT_ADDRESS_COUNT
    if (addrCount >= LIMIT_ADDRESS_COUNT) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Address limit reached');
    }

    const isDefault = await db.address.findOne({
        where: {
            customerId: customerId,
            isDefault: true
        }
    }) == null;

    await db.address.create({
        customerId: customerId,
        localAddress: addressDetails.localAddress,
        wardId: addressDetails.wardId,
        phoneNumber: addressDetails.phoneNumber,
        contactName: addressDetails.contactName,
        isDefault: isDefault
    });
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

const getAllProvinces = async () => {
    return await db.province.findAll({
        attributes: ['id', 'nameEn'],
        order: [['nameEn', 'ASC']]
    });
}

const getAllDistrictsInProvince = async (provinceId) => {
    return await db.district.findAll({
        where: {
            provinceId: provinceId
        },
        attributes: ['id', 'nameEn'],
        order: [['nameEn', 'ASC']]
    });
}

const getAllWardsInDistrict = async (districtId) => {
    return await db.ward.findAll({
        where: {
            districtId: districtId
        },
        attributes: ['id', 'nameEn'],
        order: [['nameEn', 'ASC']]
    });
}

const updateAddressInfo = async (customerId, addressId, addressDetails) => {
    const address = await db.address.findOne({
        where: {
            id: addressId,
            customerId: customerId
        }
    });

    if (!address) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
    }

    const ward = await db.ward.findOne({
        where: {
            id: addressDetails.wardId
        },
        attributes: ['id']
    });

    if (!ward) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Ward not found');
    }

    await db.address.update({
        localAddress: addressDetails.localAddress,
        wardId: addressDetails.wardId,
        phoneNumber: addressDetails.phoneNumber,
        contactName: addressDetails.contactName
    }, {
        where: {
            id: addressId
        }
    });
}

const setAddressAsDefault = async (customerId, addressId) => {
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
        throw new ApiError(httpStatus.BAD_REQUEST, 'Address is already default');
    }

    await db.address.update({
        isDefault: false
    }, {
        where: {
            customerId: customerId,
            isDefault: true
        }
    });

    await db.address.update({
        isDefault: true
    }, {
        where: {
            id: addressId
        }
    });
}

export default {
    getCustomerAddresses,
    getAddressDetails,
    getAllProvinces,
    getAllDistrictsInProvince,
    getAllWardsInDistrict,
    deleteAddress,
    updateAddressInfo,
    setAddressAsDefault,
    createAddress
};