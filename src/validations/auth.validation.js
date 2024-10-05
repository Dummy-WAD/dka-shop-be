const Joi = require("joi");

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshtoken: Joi.string().required(),
  }),
};

module.exports = {
  login,
  refreshTokens,
};
