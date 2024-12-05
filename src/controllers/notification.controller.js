import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import pick from '../utils/pick.js';
import notificationService from '../services/notification.service.js';

const getNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.user.dataValues, ['id']);
  const options = pick(req.query, ['limit', 'after']);
  const notifications = await notificationService.getNotifications(filter, options);
  res.status(httpStatus.OK).send(notifications);
});

const getNotificationsCount = catchAsync(async (req, res) => {
  const notificationsCount = await notificationService.getNotificationsCount(req.user.id);
  res.status(httpStatus.OK).send({ notificationsCount });
});

const markNotificationsAsRead = catchAsync(async (req, res) => {
  await notificationService.markNotificationsAsRead(req.user.id);
  res.status(httpStatus.OK).send({ message: 'Mark notifications as read successfully.' });
});

export default {
  getNotifications,
  getNotificationsCount,
  markNotificationsAsRead
};
