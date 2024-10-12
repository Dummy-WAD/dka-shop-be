import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
  
const getCustomerInfo = catchAsync(async (req, res) => {
  const { password, ...userInfo } = req.user.dataValues;
  res.status(httpStatus.OK).send(userInfo);
});

export default {
    getCustomerInfo,
};