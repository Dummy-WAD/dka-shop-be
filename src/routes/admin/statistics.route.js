import express from "express";
import statisticsController from "../../controllers/statistics.controller.js";
import { statisticsValidation } from "../../validations/index.js";
import validate from "../../middlewares/validate.js";
const router = express.Router();

router.get(
    "/customers",
    validate(statisticsValidation.getNewCustomerStatistics),
    statisticsController.getNewCustomerStatistics
);

export default router;
