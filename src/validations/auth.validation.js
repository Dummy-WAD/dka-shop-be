import Joi from 'joi';

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
  login,
  refreshTokens,
  logout
};
