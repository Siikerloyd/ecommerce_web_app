const pool = require('../../../config/connect_database.js');
const deliveryService=require('../services/deliveryServices.js');
exports.allDelivery=async(req,res)=>{
    
    const result=await deliveryService.allDelivery();
    res.status(200).json({message:"this the list of delivery:",result})
}

exports.getMyDeliveryProfile = async (req, res) => {
    const userId = req.user.user_id;

    const result = await deliveryService.getMyDeliveryProfile(userId);

    res.status(200).json({
        message: "Delivery profile retrieved successfully",
        result
    });
};

exports.getDeliveryAssignedOrders=async(req,res)=>{
    const userId=req.user.user_id;
    const orders = await deliveryService.getDeliveryAssignedOrders(userId);
    res.status(200).json({message:"this the lsit of oreders assigned to you:",orders})
}
exports.whoAssignedToDeliver=async(req,res)=>{
    const orderId=req.params.orderId;
    const deliveryAssigned=await deliveryService.whoAssignedToDeliver(orderId);
    res.status(200).json({message:"this the delivery assigned to this order:",deliveryAssigned})

}

exports.getmyassignedorder=async(req,res)=>{
    const userId=req.user.user_id;
    const orderId=req.params.orderId;
    const getOrder=await deliveryService.getmyassignedorder(orderId,userId);
    res.status(200).json({message:"this the order assigned to you",getOrder});
}

exports.manageaOrders = async (req, res) => {
    const orderId = req.params.orderId;
    const deliveryId = req.body.delivery_id;

    const result = await deliveryService.manageaOrders(orderId, deliveryId);

    res.status(200).json({
        message: "Delivery person assigned successfully",
        result
    });
};


exports.updateMyStatus = async (req, res) => {
    const userId = req.user.user_id;
    const { status } = req.body;

    const result = await deliveryService.updateMyStatus(userId, status);

    res.status(200).json({
        message: "Delivery status updated successfully",
        result
    });
};