import express from "express";
import passport from "passport";
import { isCustomer } from "../../middlewares/authorization.js";
import reviewController from "../../controllers/review.controller.js";
import validate from "../../middlewares/validate.js";
import { reviewValidation } from "../../validations/index.js";

const router = express.Router();

// No authentication required
router.get('/products/:productId', 
    validate(reviewValidation.getReviewsByProduct),
    reviewController.getReviewsByProduct
);

// Protect all routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(isCustomer);

router.post('/', 
    validate(reviewValidation.createNewReview),
    reviewController.createNewReview
);

export default router;
