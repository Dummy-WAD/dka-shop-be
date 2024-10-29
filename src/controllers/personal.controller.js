import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import personalService from '../services/personal.service.js';

const updateProfile = catchAsync(async (req, res) => {
    const { id } = pick(req.user.dataValues, ['id']);
    await personalService.updateProfile(id, req.body)
    res.status(httpStatus.OK).send({ message: 'Update profile success' });
  });
  
  export default {
    updateProfile
  };
  