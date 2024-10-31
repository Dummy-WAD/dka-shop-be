import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import authService from './auth.service.js'
import bcrypt from 'bcryptjs/dist/bcrypt.js';

const updateProfile = async (id, updateBody) => {
  const user = await db.user.findOne({
    where: { id }
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }  
  Object.assign(user, updateBody);
  await user.save();
};

const changePassword = async (id, oldPassword, password) => {
  const user = await db.user.findOne({
    where: { id }
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const isOldPasswordCorrect = await authService.isPasswordMatch(oldPassword, user.password)
  if (!isOldPasswordCorrect) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password is incorrect');
  } 
  user.password = await bcrypt.hash(password, 10);
  await user.save();
};

export default { 
  updateProfile,
  changePassword
};
  