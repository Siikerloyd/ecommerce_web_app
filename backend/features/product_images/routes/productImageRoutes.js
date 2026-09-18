const express = require('express');

const imagesController = require('../controllers/productImageController.js');
const {CreateProductImageSchema,UpdateProductImageSchema}=require('../../../validators/product_image_validator.js');
const validate=require('../../middleware/validate.js');
const verifyToken=require ('../../middleware/authMiddleware.js');
const {verifyRole}=require('../../middleware/authorization.js');

const router = express.Router();

router.get(
    '/products/:productId/images',
    imagesController.getAllImages
);


router.get('/products/:productId/images/:imageId',imagesController.getImageById);

router.post('/products/:productId/images',verifyToken,verifyRole('ADMIN'),validate(CreateProductImageSchema),imagesController.addImage);

router.patch('/products/:productId/images/:imageId',verifyToken,verifyRole('ADMIN'),validate(UpdateProductImageSchema),imagesController.updateImage);
router.delete('/products/:productId/images/:imageId',verifyToken,verifyRole('ADMIN'),imagesController.deleteImageById);

module.exports = router;