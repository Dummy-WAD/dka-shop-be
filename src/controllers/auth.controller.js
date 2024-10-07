import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { authServices, tokenServices } from '../services/index.js';

const register = catchAsync(async (req, res) => {
  const user = await authServices.createUser(req.body);
  const tokens = await tokenServices.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authServices.login({ email, password });
  const tokens = await tokenServices.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authServices.logout(req.body.refresh_token);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authServices.refreshAuth(req.body.refresh_token);
  res.send({ ...tokens });
});

export default {
  register,
  login,
  logout,
  refreshTokens
};
