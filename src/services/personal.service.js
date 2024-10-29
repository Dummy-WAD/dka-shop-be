import db from '../models/models/index.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';

const updateProfile = async (id, updateBody) => {
  const user = await db.user.findOne({
    where: { id }
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.gender) {
    updateBody.gender = updateBody.gender === 'FEMALE' ? 0 : 1;
  }
  Object.assign(user, updateBody);
  await user.save();
};

export default { 
  updateProfile
};
  