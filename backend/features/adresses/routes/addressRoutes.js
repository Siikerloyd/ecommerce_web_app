const addressesControllers=require('../controllers/adressControllers.js');
const validate=require('../../../features/middleware/validate.js');
const verifyToken=require('../../middleware/authMiddleware.js');
const {CreateAddressSchema,UpdateAddressSchema}=require('../../../validators/addresses_validators.js');
const express=require('express');
const router=express.Router();
//put routes here
router.post('/addresses',verifyToken,validate(CreateAddressSchema),addressesControllers.createAddress);
router.get('/addresses',verifyToken,addressesControllers.getUserAddresses);
router.get('/addresses/:id',verifyToken,addressesControllers.getAddressById);
router.patch('/addresses/:id',verifyToken,validate(UpdateAddressSchema),addressesControllers.updateAddress);
router.delete('/addresses/:id',verifyToken,addressesControllers.deleteAddressById);
module.exports=router;

