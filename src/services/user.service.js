import httpStatus from 'http-status';
import db from "../models/index.js";
import ApiError from '../utils/ApiError.js';
import paginate from './plugins/paginate.plugin.js';
import { AccountStatus, UserRole } from '../utils/enums.js';


const { User } = db;

const isEmailTaken = async (email, excludeUserId) => {
  const user = await User.findOne({
    where: {
      email: email,
      id: { [Sequelize.Op.ne]: excludeUserId }
    }
  });
  return !!user; 
};

const createUser = async (userData) => {

  if (await User.findOne({ where: { email: userData.email }})) {
    throw new ApiError(httpStatus.CONFLICT, "Email already taken");
  }

  const savedUser = await User.create({
    ...userData,
    password: await bcrypt.hash(userData.password, process.env.PASSWORD_HASH_ROUND),
    role: UserRole.CUSTOMER,
    status: AccountStatus.INACTIVE
  });

  return savedUser;
}

const queryUsers = async (filter, options) => {
  const users = await paginate('users', filter, options);
  return users;
};

const getUserById = async (id) => {
  return User.findOne({
    where: {
      id
    }
  });
};

const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
