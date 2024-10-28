import Joi from 'joi';

const phoneNumberPattern = new RegExp(/(0[3|5|7|8|9])+([0-9]{8})\b/);
const passwordPattern = new RegExp(/^(?=.*\d)(?=.*[!@#$%^&*()_+{}|:<>?~`-])(?=.*[a-z])(?=.*[A-Z])\S{8,}$/);

const register = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    phoneNumber: Joi.string().pattern(phoneNumberPattern).required(),
    password: Joi.string().pattern(passwordPattern).required(),
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

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().optional(),
    lastName: Joi.string().trim().optional(),
    phoneNumber: Joi.string().pattern(phoneNumberPattern).optional(),
    gender: Joi.number().min(0).optional(),
  }),
};

export default {
  register,
  resendConfirmationEmail,
  login,
  refreshTokens,
  logout,
  updateProfile
};
