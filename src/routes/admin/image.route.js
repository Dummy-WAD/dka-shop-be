import express from "express";
import validate from '../../middlewares/validate.js';
import imageValidation from "../../validations/image.validation.js";
import imageController from "../../controllers/image.controller.js";
const router = express.Router();

router.post(
  "/generate-presigned-urls",
  validate(imageValidation.generatePresignedUrls),
  imageController.generatePresignedUrls
);

export default router;
