const addressService = require('../services/addressServices.js');

exports.createAddress = async (req, res) => {
    const data = req.body;
    const userID=req.user.user_id;

    const result = await addressService.createAddress(userID,data);

    res.status(201).json({
        message: 'Address added successfully',
        result
    });
};
exports.getUserAddresses=async(req,res)=>{
     const userId = req.user.user_id;
     const result =await addressService.getUserAddresses(userId);
     res.status(200).json({
        message: 'this is the list of address you provided:',
        result
    });
}

exports.getAddressById = async (req, res) => {
    const addressId = req.params.id;
    const userId = req.user.user_id;

    const result = await addressService.getAddressById(
        userId,
        addressId
    );

    res.status(200).json({
        message: 'Address retrieved successfully',
        result
    });
};


exports.updateAddress=async(req,res)=>{
    const data=req.body;
    const userId=req.user.user_id;
    const addressId=req.params.id;
    const result =await addressService.updateAddress(userId,addressId,data);
    res.status(200).json({
        message: 'Address updated successfully',
        result
    });
}
