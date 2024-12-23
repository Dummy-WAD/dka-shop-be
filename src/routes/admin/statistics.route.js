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

router.get(
    "/orders",
    validate(statisticsValidation.getOrderStatistics),
    statisticsController.getOrderStatistics
);

router.get(
    "/products/revenue",
    validate(statisticsValidation.getProductRevenueStatistics),
    statisticsController.getProductRevenueStatistics
);

router.get(
    "/products/sold",
    validate(statisticsValidation.getProductSoldStatistics),
    statisticsController.getProductSoldStatistics
);

router.get(
    "/categories/revenue",
    validate(statisticsValidation.getCategoryRevenueStatistics),
    statisticsController.getCategoryRevenueStatistics
);

router.get(
    "/categories/sold",
    validate(statisticsValidation.getCategorySoldStatistics),
    statisticsController.getCategorySoldStatistics
);

router.get(
    "/revenue",
    validate(statisticsValidation.getRevenueStatistics),
    statisticsController.getRevenueStatistics
);

export default router;
