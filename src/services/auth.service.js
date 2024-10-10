import httpStatus from "http-status";
import db from "../models/index.js"; 
import { userServices, tokenServices } from "../services/index.js";
import bcrypt from 'bcryptjs';
import ApiError from "../utils/ApiError.js";
import dotenv from 'dotenv';
import { Sequelize } from "sequelize";
import { hash } from "bcrypt";
dotenv.config();
const { User, Token } = db;

const isPasswordMatch = async function (password, hashPassword) {
  return bcrypt.compare(password, hashPassword);
};

const createUser = async (userData) => {

  if (await User.findOne({ where: { email: userData.email }})) {
    throw new ApiError(httpStatus.CONFLICT, "Email already taken");
  }

  const savedUser = await User.create({
    ...userData,
    password: await bcrypt.hash(userData.password, 8),
    role: 'CUSTOMER',
    status: 'INACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return savedUser;
}

const login = async (userData) => {
  const foundUser = await User.findOne({
    where: { email: userData.email },
    attributes: [
      'id',
      'email',
      'role',
      'status',
      'password',
      [Sequelize.fn('concat',
        Sequelize.fn('coalesce', Sequelize.col('last_name'), ''),
        ' ',
        Sequelize.fn('coalesce', Sequelize.col('first_name'), '')
      ), 'fullName']
    ],
  });

  if (!foundUser || !(await isPasswordMatch(userData.password, foundUser?.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect username or password");
  }
  const user = foundUser.get({ plain: true });
  delete user.password;

  return user;
};

const logout = async (refresh_token) => {
  const refreshTokenDoc = await Token.findOne({
    where: {
      refresh_token
    }
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.destroy();
};

const refreshAuth = async (refresh_token) => {
    const refreshTokenDoc = await tokenServices.verifyToken(refresh_token);
    const user = await userServices.getUserById(refreshTokenDoc.user_id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }
    await refreshTokenDoc.destroy();
    return tokenServices.generateAuthTokens(user);
};

export default { createUser, login, logout, refreshAuth };
