import Joi from 'joi';
import customValidation from './custom.validation.js'

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    phoneNumber: Joi.string().trim().custom(customValidation.phoneNumber).optional(),
    gender: Joi.string().trim().valid('MALE', 'FEMALE').optional(),
  }),
};

const changePassword = {  
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    password: Joi.string().custom(customValidation.password).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),
};

export default {
  updateProfile,
  changePassword,
};