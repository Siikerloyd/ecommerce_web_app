const cartService=require('../services/cartService.js');


exports.getCart = async (req, res) => {

    const userId = req.user.user_id;

    const result = await cartService.getCart(userId);

    res.status(200).json({
        message: "this ur cart list!:",
        result
    });
};

exports.addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const userId = req.user.user_id;

    const result = await cartService.addToCart(
        product_id,
        quantity,
        userId
    );

    res.status(201).json({
        message: "Product added to cart",
        result: result
    });
};

exports.updateCartItems = async (req, res) => {
    const userId = req.user.user_id;
    const cartItemId = req.params.cartItemId;
    const { quantity } = req.body;

    const result = await cartService.updateCartItems(
        cartItemId,
        quantity,
        userId
    );

    res.status(200).json({
        message: "Product updated successfully",
        result
    });
};


exports.deleteCartItem = async (req, res) => {
    const userId = req.user.user_id;
    const cartItemId = req.params.cartItemId;

    const result = await cartService.deleteCartItem(
        cartItemId,
        userId
    );

    res.status(200).json({
        message: "Cart item deleted successfully",
        result
    });
};