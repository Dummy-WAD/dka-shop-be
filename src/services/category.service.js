const httpStatus = require('http-status');
const { Category } = require("../models");
const ApiError = require('../utils/ApiError');

const createCategory = async (categoryPayload) => {
    const category = await Category.findOne({
        where: {
            name: categoryPayload.name,
        }
    });
    if (!!category) throw new ApiError(httpStatus.BAD_REQUEST, "This category already taken");
    return Category.create(categoryPayload);
};

module.exports = { createCategory }