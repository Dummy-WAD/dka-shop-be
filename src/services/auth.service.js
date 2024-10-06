const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
var bcrypt = require('bcryptjs');
require("dotenv").config();

const isPasswordMatch = async function (password, hashPassword) {
  return bcrypt.compare(password, hashPassword);
};

const login = async (userData) => {
  const user = await User.findOne({ where: { email: userData.email }});
  if (!user || !(await isPasswordMatch(userData.password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect username or password");
  }
  return user;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

module.exports = { login, logout, refreshAuth };
