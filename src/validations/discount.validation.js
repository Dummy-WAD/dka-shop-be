import Joi from 'joi';
import { DiscountType } from '../utils/enums.js';
import customValidation from './custom.validation.js'

const getDiscountDetail = {
  params: Joi.object().keys({
    discountId: Joi.number().integer().positive().required()
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).default(5)
  })
};

const createDiscount = {
  body: Joi.object().keys({
    discountValue: Joi.number().positive().required().custom(customValidation.validateDiscountValue),
    discountType: Joi.string().required().valid(...Object.values(DiscountType)),
    startDate: Joi.date().iso().required().custom(customValidation.validateStartDate),
    expirationDate: Joi.date().iso().required().custom(customValidation.validateExpirationDate),
  }),
};

const editDiscount = {
  params: Joi.object().keys({
    discountId: Joi.number().integer().positive().required()
  }),
  body: Joi.object().keys({
    discountValue: Joi.number().positive().optional().custom(customValidation.validateDiscountValue),
    discountType: Joi.string().optional().valid(...Object.values(DiscountType)),
    startDate: Joi.date().iso().optional(),
    expirationDate: Joi.date().iso().optional(),
  })
  .custom((value, helpers) => {
    if ((value.discountValue && !value.discountType) || (value.discountType && !value.discountValue)) {
      return helpers.message('Both discountValue and discountType must be provided together');
    }
    return value;
  }),
};

const applyDiscount = {
    params: Joi.object().keys({
        discountId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        productIds: Joi.array().items(Joi.number().integer().positive().required()).required(),
        isConfirmed: Joi.boolean().required()
    })
}

export default {
  getDiscountDetail,
  createDiscount,
  editDiscount,
  applyDiscount
}