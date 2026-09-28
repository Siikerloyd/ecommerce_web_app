const express = require("express");

const router = express.Router();

const verifyToken = require("../../middleware/authMiddleware.js");
const validate = require("../../middleware/validate.js");

const wishlistController = require("../controller/wishlistController.js");

const {
    AddWishlistSchema
} = require("../../../validators/wishlist_validator.js");

router.post(
    "/wishlist",
    verifyToken,
    validate(AddWishlistSchema),
    wishlistController.addToWishlist
);

router.get("/wishlist",verifyToken,wishlistController.getwishlist);

router.delete("/wishlist/:productId",verifyToken,wishlistController.deleteProductWishlist);

module.exports = router;