import Joi from 'joi';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().trim(),
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
    description: Joi.string().trim().allow('').optional()
  })
};

export default {
    createCategory,
    deleteCategory,
    editCategory
}