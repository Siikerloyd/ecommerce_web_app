const wishlistService = require("../services/wishlistServices.js");

exports.addToWishlist = async (req, res) => {
    const userId = req.user.user_id;
    const { product_id } = req.body;

    const result = await wishlistService.addToWishlist(
        userId,
        product_id
    );

    res.status(201).json({
        message: "Product added to wishlist successfully!",
        result
    });
};

exports.getwishlist=async(req,res)=>{
    const userId=req.user.user_id;
    const result=await wishlistService.getwishlist(userId);
    res.status(200).json({
        message: "this the list of Product in your wishlist!",
        result
    });
}
//DELETE /api/wishlist/:productId
exports.deleteProductWishlist=async(req,res)=>{
    const productId=req.params.productId;
    const userId=req.user.user_id;
    const result=await wishlistService.deleteProductWishlist(productId,userId);
    res.status(200).json({
        message: "product deleted successfully!",
        result
    });

}