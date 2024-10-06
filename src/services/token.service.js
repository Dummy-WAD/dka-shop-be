const jwt = require('jsonwebtoken');
const moment = require('moment');
const config = require('../config/config');
const { Token } = require('../models');
const { tokenTypes } = require('../config/tokens');

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (refresh_token, user_id, status) => {
  const tokenDoc = await Token.create({
    refresh_token,
    user_id,
    status,
  });
  return tokenDoc;
};

const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

const generateAuthTokens = async (userId) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(userId, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(userId, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, userId, '');

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};


// const generateResetPasswordToken = async (email) => {
//   const user = await userService.getUserByEmail(email);
//   if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
//   }
//   const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
//   const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
//   await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
//   return resetPasswordToken;
// };

const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  // generateResetPasswordToken,
  generateVerifyEmailToken,
};
