import Joi from 'joi';

const phoneNumberPattern = new RegExp(/(0[3|5|7|8|9])+([0-9]{8})\b/);

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    phoneNumber: Joi.string().pattern(phoneNumberPattern).optional(),
    gender: Joi.number().min(0).optional(),
  }),
};
  
export default {
  updateProfile
};