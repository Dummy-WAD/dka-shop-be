import Joi from 'joi';
import customValidation from './custom.validation.js'

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    phoneNumber: Joi.string().trim().custom(customValidation.phoneNumber).required(),
    password: Joi.string().custom(customValidation.password).required(),    
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),
}

const resendConfirmationEmail = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refresh_token: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refresh_token: Joi.string().required(),
  }),
};

export default {
  register,
  resendConfirmationEmail,
  login,
  refreshTokens,
  logout
};
