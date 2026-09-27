const reviewService = require("../services/reviewsServices.js");

exports.createReview = async (req, res) => {
    const userId = req.user.user_id;
    const data = req.body;

    const result = await reviewService.createReview(userId, data);

    res.status(201).json({
        message: "Review created successfully!",
        result
    });
};

exports.getProductReviews = async (req, res) => {
    const productId = req.params.productId;

    const result = await reviewService.getProductReviews(productId);

    res.status(200).json({
        message: "Reviews retrieved successfully!",
        result
    });
};

exports.getReviewById = async (req, res) => {
    const reviewId = req.params.reviewId;

    const result = await reviewService.getReviewById(reviewId);

    res.status(200).json({
        message: "Review retrieved successfully!",
        result
    });
};

exports.updateReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user.user_id;
    const data = req.body;

    const result = await reviewService.updateReview(
        reviewId,
        userId,
        data
    );

    res.status(200).json({
        message: "Review updated successfully!",
        result
    });
};

exports.deleteReview = async (req, res) => {
    const reviewId = req.params.reviewId;
    const userId = req.user.user_id;

    await reviewService.deleteReview(reviewId, userId);

    res.status(200).json({
        message: "Review deleted successfully!"
    });
};