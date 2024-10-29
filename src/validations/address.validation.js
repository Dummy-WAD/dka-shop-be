import Joi from 'joi';

const deleteAddress = {
    params: Joi.object().keys({
        addrId: Joi.number().integer().positive().required()
    })
};

export default {
    deleteAddress
}