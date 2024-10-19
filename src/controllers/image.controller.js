import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import s3storageService from '../services/external/s3storage.service.js';
import dotenv from "dotenv";
dotenv.config();

const generatePresignedUrls = catchAsync(async (req, res) => {
    const bucketName = process.env.AWS_IMAGE_BUCKET_NAME;
    
    const { keys } = req.body;

    const urls = await s3storageService.getPresignedUrls(bucketName, keys);
    res.status(httpStatus.OK).send({ urls });
});

export default { generatePresignedUrls };