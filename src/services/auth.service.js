import httpStatus from "http-status";
import db from "../models/index.js"; 
import { userServices, tokenServices } from "../services/index.js";
import bcrypt from 'bcryptjs';
import ApiError from "../utils/ApiError.js";
import dotenv from 'dotenv';
dotenv.config();
const { User, Token } = db;

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

const logout = async (refresh_token) => {
  const refreshTokenDoc = await Token.findOne({ refresh_token });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.destroy();
};

const refreshAuth = async (refresh_token) => {
  try {
    const refreshToken = await Token.findOne({ refresh_token });
    if (!refreshToken) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    };
    const refreshTokenDoc = await tokenServices.verifyToken(refresh_token);
    const user = await userServices.getUserById(refreshTokenDoc.user_id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    };
    await refreshTokenDoc.destroy();
    return tokenServices.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export default { login, logout, refreshAuth };
