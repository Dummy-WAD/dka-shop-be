import catchAsync from "../utils/catchAsync.js";
import {addressServices} from "../services/index.js";
import httpStatus from "http-status";

const getCustomerAddresses = catchAsync(async (req, res) => {
    const addresses = await addressServices.getCustomerAddresses(req.user.id);
    res.status(httpStatus.OK).send(addresses);
});

const deleteAddress = catchAsync(async (req, res) => {
    await addressServices.deleteAddress(req.user.id, req.params.addrId);
    res.status(httpStatus.OK).send("Address deleted");
});

export default {
    getCustomerAddresses,
    deleteAddress
};