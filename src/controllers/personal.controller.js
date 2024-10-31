import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import personalService from '../services/personal.service.js';

const updateProfile = catchAsync(async (req, res) => {
  const { id } = pick(req.user.dataValues, ['id']);
  await personalService.updateProfile(id, req.body);
  res.status(httpStatus.OK).send({ message: 'Update profile success' });
});

const changePassword = catchAsync(async (req, res) => {
  const { id } = pick(req.user.dataValues, ['id']);
  const { oldPassword, password } = req.body
  await personalService.changePassword(id, oldPassword, password)
  res.status(httpStatus.OK).send({ message: 'Change password success' });
});

export default {
  updateProfile,
  changePassword
};
  