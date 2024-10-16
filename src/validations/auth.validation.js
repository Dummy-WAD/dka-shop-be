import Joi from 'joi';

const phoneNumberPattern = new RegExp(/^[0-9]{10}$/);
const passwordPattern = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~`-])(?=.*[a-zA-Z]).{8,}$/);

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phoneNumber: Joi.string().pattern(phoneNumberPattern).required(),
    password: Joi.string().pattern(passwordPattern).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),
}

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
  login,
  refreshTokens,
  logout
};
