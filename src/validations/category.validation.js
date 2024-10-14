import Joi from 'joi';

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
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
    name: Joi.string().optional(),
    description: Joi.string().optional(),
  })
};

export default {
    createCategory,
    deleteCategory,
    editCategory
}