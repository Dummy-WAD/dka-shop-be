import Joi from 'joi';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
  }),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.number().integer().positive().required()
  })
};

const editCategory = {
  params: Joi.object().keys({
    categoryId: Joi.number().integer().positive().required()
  }),
  body: Joi.object().keys({
    name: Joi.string().trim().optional(),
    description: Joi.string().trim().optional()
  })
};

const getBestSellerCategories = {
  query: Joi.object().keys({
    limit: Joi.number().integer().positive().optional().default(6)
  })
};

export default {
    createCategory,
    deleteCategory,
    editCategory,
    getBestSellerCategories
}