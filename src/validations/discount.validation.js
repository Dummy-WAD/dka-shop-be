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
    })
}

const revokeDiscount = {
    params: Joi.object().keys({
        discountId: Joi.number().integer().positive().required()
    }),
    body: Joi.object().keys({
        productId: Joi.number().integer().positive().required()
    })
}

const getAppliedProducts = {
    params: Joi.object().keys({
        discountId: Joi.number().integer().positive().required()
    }),
    query: Joi.object().keys({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(5),
        keyword: Joi.string().trim().max(100).optional(),
        exclude: Joi.boolean().default(false)
    })
}

const deleteDiscount = {
  params: Joi.object().keys({
    discountId: Joi.number().integer().positive().required()
  })
}

const getAllDiscounts = {
  query: Joi.object().keys({
      keyword: Joi.string().trim().max(50).optional(),
      type: Joi.string().optional().valid(...Object.values(DiscountType)),
      sortBy: Joi.string().valid('id', 'discountValue', 'discountType', 'startDate', 'expirationDate', 'createdAt', 'updatedAt').default('createdAt'),
      order: Joi.string().valid('asc', 'desc').default('desc'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      startDate: Joi.date().iso().optional(),
      expirationDate: Joi.date().iso().optional(),
  })
};

export default {
  getDiscountDetail,
  createDiscount,
  editDiscount,
  applyDiscount,
  revokeDiscount,
  getAppliedProducts,
  deleteDiscount,
  getAllDiscounts
}