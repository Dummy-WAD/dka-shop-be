import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { deliveryServiceService } from '../services/index.js';

const getAllDeliveryServicesForCustomer = catchAsync(async (req, res) => {
  const deliveryServices = await deliveryServiceService.getAllActiveDeliveryServices();
  res.status(httpStatus.OK).send(deliveryServices);
});

export default {
  getAllDeliveryServicesForCustomer
}