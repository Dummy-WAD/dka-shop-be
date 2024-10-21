import Joi from 'joi';

const generatePresignedUrls = {
  body: Joi.object().keys({
    keys: Joi.array().items(Joi.string().trim().required()).unique().required(),
  }),
};

export default {
    generatePresignedUrls
}
