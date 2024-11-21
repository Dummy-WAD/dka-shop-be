import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import notificationService from '../services/notification.service.js';

const getNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.user.dataValues, ['id']);
  const options = pick(req.query, ['limit', 'page']);
  const notifications = await notificationService.getNotifications(filter, options);
  res.status(httpStatus.OK).send(notifications);
});

export default {
  getNotifications
};
