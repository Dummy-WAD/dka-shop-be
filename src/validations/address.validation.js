import Joi from 'joi';

const getAddressDetails = {
    params: Joi.object().keys({
        addrId: Joi.number().integer().positive().required()
    })
};

const getAllDistrictsInProvince = {
    query: Joi.object().keys({
        provinceId: Joi.string().trim().required()
    })
};

const getAllWardsInDistrict = {
    query: Joi.object().keys({
        districtId: Joi.string().trim().required()
    })
}

export default {
    getAddressDetails,
    getAllDistrictsInProvince,
    getAllWardsInDistrict
}