const express = require('express');
const router = express.Router();
const validate=require('../../middleware/validate.js');
const verifyToken=require ('../../middleware/authMiddleware.js');
const cartController=require('../controllers/cartController.js');
const {AddCartItemSchema,UpdateCartItemSchema}=require('../../../validators/cart_validator.js');
router.get('/cart',verifyToken,cartController.getCart);
router.post(
    "/cart/items",
    verifyToken,
    validate(AddCartItemSchema),
    cartController.addToCart
);

router.patch(
    "/cart/items/:cartItemId",
    verifyToken,
    validate(UpdateCartItemSchema),
    cartController.updateCartItems
);


router.delete(
    "/cart/items/:cartItemId",
    verifyToken,
    cartController.deleteCartItem
);

module.exports = router;