import Joi from 'joi';
import customValidation from "./custom.validation.js";

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

const updateAddressInfo = {
    params: Joi.object().keys({
        addrId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        wardId: Joi.string().trim().optional(),
        localAddress: Joi.string().trim().optional(),
        phoneNumber: Joi.string().trim().custom(customValidation.phoneNumber).optional(),
        contactName: Joi.string().trim().optional(),
    })
}

const createAddress = {
    body: Joi.object().keys({
        wardId: Joi.string().trim().required(),
        localAddress: Joi.string().trim().required(),
        phoneNumber: Joi.string().trim().custom(customValidation.phoneNumber).required(),
        contactName: Joi.string().trim().required(),
    })
}

export default {
    getAddressDetails,
    getAllDistrictsInProvince,
    getAllWardsInDistrict,
    updateAddressInfo,
    createAddress
}