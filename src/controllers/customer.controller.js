import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
  
const getCustomerInfo = catchAsync(async (req, res) => {
  const userInfo = pick(req.user.dataValues, ['id', 'email', 'firstName', 'lastName', 'role', 'status']);
  res.status(httpStatus.OK).send(userInfo);
});

export default {
    getCustomerInfo,
};