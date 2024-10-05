const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authServices, tokenService } = require('../services/index');

const register = catchAsync(async (req, res) => {
  const user = await authServices.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.login({ email, password });
  const tokens = await tokenService.generateAuthTokens(user.id);
  res.status(httpStatus.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authServices.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authServices.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens
};
