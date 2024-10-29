import db from "../models/models/index.js";

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

export default {
    getCustomerAddresses
};