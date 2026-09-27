const express = require("express");

const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware.js");
const validate = require("../../middleware/validate.js");

const reviewController = require("../controllers/reviewsController.js");

const {
    CreateReviewSchema,
    UpdateReviewSchema
} = require("../../../validators/reviews_validator.js");


router.post(
    "/reviews",
    verifyToken,
    validate(CreateReviewSchema),
    reviewController.createReview
);

router.get(
    "/reviews/product/:productId",
    reviewController.getProductReviews
);

router.get(
    "/reviews/:reviewId",
    reviewController.getReviewById
);

router.patch(
    "/reviews/:reviewId",
    verifyToken,
    validate(UpdateReviewSchema),
    reviewController.updateReview
);

router.delete(
    "/reviews/:reviewId",
    verifyToken,
    reviewController.deleteReview
);

module.exports = router;