import catchAsync from "../utils/catchAsync.js";
import {addressServices} from "../services/index.js";
import httpStatus from "http-status";

const getCustomerAddresses = catchAsync(async (req, res) => {
    const addresses = await addressServices.getCustomerAddresses(req.user.id);
    res.status(httpStatus.OK).send(addresses);
});

const getAddressDetails = catchAsync(async (req, res) => {
    const address = await addressServices.getAddressDetails(req.user.id, req.params.addrId);
    res.status(httpStatus.OK).send(address);
});

const deleteAddress = catchAsync(async (req, res) => {
    await addressServices.deleteAddress(req.user.id, req.params.addrId);
    res.status(httpStatus.OK).send("Address deleted");
});

const getAllProvinces = catchAsync(async (req, res) => {
    const provinces = await addressServices.getAllProvinces();
    res.status(httpStatus.OK).send(provinces);
});

const getAllDistrictsInProvince = catchAsync(async (req, res) => {
    const districts = await addressServices.getAllDistrictsInProvince(req.query.provinceId);
    res.status(httpStatus.OK).send(districts);
});

const getAllWardsInDistrict = catchAsync(async (req, res) => {
    const wards = await addressServices.getAllWardsInDistrict(req.query.districtId);
    res.status(httpStatus.OK).send(wards);
});

const updateAddressInfo = catchAsync(async (req, res) => {
    const { wardId, localAddress } = req.body;
    await addressServices.updateAddressInfo(req.user.id, req.params.addrId, { wardId, localAddress });
    res.status(httpStatus.OK).send("Address updated");
});

const setDefaultAddress = catchAsync(async (req, res) => {
    await addressServices.setAddressAsDefault(req.user.id, req.params.addrId);
    res.status(httpStatus.OK).send("Default address set");
})

export default {
    getCustomerAddresses,
    getAddressDetails,
    deleteAddress,
    getAllProvinces,
    getAllDistrictsInProvince,
    getAllWardsInDistrict,
    updateAddressInfo,
    setDefaultAddress
};