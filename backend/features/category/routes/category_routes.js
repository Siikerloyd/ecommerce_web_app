const express = require('express');
const categoryControllers=require('../controllers/category_controllers.js');
const {CompleteCategorySchema,UpdateCategorySchema}=require('../../../validators/category_validator.js');
const validate=require('../../middleware/validate.js');
const verifyToken=require('../../middleware/authMiddleware.js');
const {updateAuth, verifyRole}=require ('../../middleware/authorization.js');
const router = express.Router();
//categories routes 
router.post('/category',validate(CompleteCategorySchema),verifyToken,verifyRole('ADMIN'),categoryControllers.createCategory);
router.get('/categories',categoryControllers.getAllCategories);
router.get('/category/:id',categoryControllers.getCategoryById);
router.patch('/category/:id',verifyToken,verifyRole('ADMIN'),validate(UpdateCategorySchema),categoryControllers.UpdateCategory)
router.delete('/category/:id',verifyToken,verifyRole('ADMIN'),categoryControllers.deleteCategoryById)
module.exports=router;

