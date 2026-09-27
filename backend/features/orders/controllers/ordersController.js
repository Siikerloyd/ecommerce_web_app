const orderService=require('../services/ordersServices.js');


exports.getOrders = async (req, res) => {
    const userId = req.user.user_id;

    const result = await orderService.getOrders(userId);

    res.status(200).json({
        message: "Orders retrieved successfully",
        result
    });
};

exports.getOrderById = async (req, res) => {
    const userId = req.user.user_id;
    const orderId = req.params.orderId;

    const result = await orderService.getOrderById(
        orderId,
        userId
    );

    res.status(200).json({
        message: "Order retrieved successfully",
        result
    });
};

exports.createOrder=async(req,res)=>{
    const userId=req.user.user_id;
    const data=req.body;
    const result = await orderService.createOrder(userId,data);
    res.status(201).json({
        message: "Order created successfully",
        result
    });   
}

exports.updateOrderStatus=async(req,res)=>{
    const orderId=req.params.orderId;
    const data=req.body;
    const result=await orderService.updateOrderStatus(orderId,data);
    res.status(200).json({message:"Order status updated successfully!",
        result})

}