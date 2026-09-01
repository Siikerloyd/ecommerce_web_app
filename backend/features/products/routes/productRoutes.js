const express = require('express');
const router = express.Router();
const productsController=require('../controllers/productController.js');
const {CompleteProductSchema,UpdateProductSchema}=require('../../../validators/product_validator.js');
const validateProduct=require('../../middleware/validate.js');
const verifyToken=require('../../middleware/authMiddleware.js');
const {verifyRole}=require('../../middleware/authorization.js');
router.post('/products',verifyToken,verifyRole("ADMIN"),validateProduct(CompleteProductSchema),productsController.createProduct);
router.get('/products',productsController.searchProducts);
router.get('/products/:id',productsController.getProductById);
router.patch('/products/:id',verifyToken,verifyRole("ADMIN"),validateProduct(UpdateProductSchema),productsController.dynamicProductUpdate)
router.delete('/products/:id',verifyToken,verifyRole("ADMIN"),productsController.deleteProductById);
module.exports=router;