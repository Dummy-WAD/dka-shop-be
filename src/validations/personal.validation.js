import Joi from 'joi';
import customValidation from './custom.validation.js'

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    phoneNumber: Joi.string().custom(customValidation.phoneNumber).optional(),
    gender: Joi.string().trim().valid('MALE', 'FEMALE').optional(),
  }),
};
  
export default {
  updateProfile
};