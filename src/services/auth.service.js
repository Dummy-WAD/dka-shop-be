import httpStatus from "http-status";
import db from "../models/models/index.js"; 
import { userServices, tokenServices, confirmationTokenService } from "../services/index.js";
import bcrypt from 'bcryptjs';
import ApiError from "../utils/ApiError.js";
import dotenv from 'dotenv';
import { AccountStatus, ConfirmationTokenStatus } from "../utils/enums.js";
dotenv.config();

const isPasswordMatch = async function (password, hashPassword) {
  return bcrypt.compare(password, hashPassword);
};

const createUser = async (userData) => {

  const SALT_ROUND = 10;

  if (await db.user.findOne({ where: { email: userData.email }})) {
    throw new ApiError(httpStatus.CONFLICT, "Email already taken");
  }

  const savedUser = await db.user.create({
    ...userData,
    password: await bcrypt.hash(userData.password, SALT_ROUND),
    role: 'CUSTOMER',
    status: 'INACTIVE',
  });

  return savedUser;
}

const confirmRegisterByToken = async (token) => {
  const confirmationToken = await db.confirmationToken.findOne({
    where: {
      confirmationToken: token,
      status: ConfirmationTokenStatus.PENDING,
    },
  });

  if (!confirmationToken) {
    throw new ApiError(httpStatus.NOT_FOUND, "Confirmation token not found");
  }

  const user = await db.user.findByPk(confirmationToken.userId);
  user.status = AccountStatus.ACTIVE;
  await user.save();

  confirmationToken.status = ConfirmationTokenStatus.CONFIRMED;
  await confirmationToken.save();

  return { email: user.email, status: user.status };
}

const login = async (userData) => {
  const foundUser = await db.user.findOne({
    where: { email: userData.email },
    attributes: [
      'id',
      'email',
      'role',
      'status',
      'password',
      'firstName',
      'lastName'
    ],
  });

  if (!foundUser || !(await isPasswordMatch(userData.password, foundUser?.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect username or password");
  }
  const user = foundUser.get({ plain: true });
  delete user.password;

  return user;
};

const recreateConfirmationToken = async (email) => {
  const user = await db.user.findOne({
    where: { email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === AccountStatus.ACTIVE) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User already activated");
  }

  // Invalidate old confirmation tokens
  confirmationTokenService.invalidateConfirmationTokenOfUser(user.id);

  return await confirmationTokenService.createConfirmationToken(user.id);
}

const logout = async (refresh_token) => {
  const refreshTokenDoc = await db.token.findOne({
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

export default { 
  createUser, 
  confirmRegisterByToken, 
  login, 
  recreateConfirmationToken, 
  logout, 
  refreshAuth,
  isPasswordMatch
};
