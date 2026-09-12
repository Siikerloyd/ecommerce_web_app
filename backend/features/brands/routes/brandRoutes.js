const express=require('express');
const router=express.Router();
const {CompleteBrandSchema, UpdateBrandSchema}=require('../../../validators/brand_validators.js');
const validate=require('../../middleware/validate.js');
const brandControllers=require('../controllers/brandControllers.js');
const verifyToken=require('../../middleware/authMiddleware.js');
const {verifyRole}=require ('../../middleware/authorization.js');
router.get('/brands',brandControllers.getAllBrands);
router.get('/brands/:id',brandControllers.getBrandById);
router.patch('/brands/:id',verifyToken,verifyRole('ADMIN'),validate(UpdateBrandSchema),brandControllers.updateBrand);
router.post('/brands',verifyToken,verifyRole('ADMIN'),validate(CompleteBrandSchema),brandControllers.createBrand);
router.delete(
    '/brands/:id',
    verifyToken,
    verifyRole('ADMIN'),
    brandControllers.deleteBrandById
);
module.exports=router;
