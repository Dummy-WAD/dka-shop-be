import Joi from 'joi';

const getAllCartItems = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(15).optional()
  })
};

const addProductToCart = {
  body: Joi.object().keys({
    productVariantId: Joi.number().integer().positive().required().strict(),
    quantity: Joi.number().integer().positive().required().strict()
  }),
};

export default {
  getAllCartItems,
  addProductToCart
}