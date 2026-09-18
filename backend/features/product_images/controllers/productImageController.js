const { ur } = require('zod/v4/locales');
const imagesService = require('../services/productImageService.js');

exports.getAllImages = async (req, res) => {
    const productImage = req.params.productId;
    const result = await imagesService.getAllImages(productImage);
    res.status(200).json({ message: 'this the list of images for the product youre looking for!', result })

}

exports.getImageById = async (req, res) => {

    const productId = req.params.productId;
    const imageId = req.params.imageId;

    const result = await imagesService.getImageById(productId, imageId);

    res.status(200).json({
        message: 'This is the image you are looking for!',
        result
    });
};

exports.addImage = async (req, res) => {
    const productId = req.params.productId;
    const data = req.body;

    const result = await imagesService.addImage(productId, data);

    res.status(201).json({
        message: 'image added to product!',
        result
    });
};

exports.updateImage = async (req, res) => {
    const productId = req.params.productId;
    const imageId = req.params.imageId;
    const data = req.body;

    const result = await imagesService.updateImage(
        productId,
        imageId,
        data
    );

    res.status(200).json({
        message: 'Image updated!',
        result
    });
};

exports.deleteImageById=async(req,res)=>{
    const imageId=req.params.imageId;
    const productId=req.params.productId;
    const result =await imagesService.deleteImageById(imageId,productId);
     res.status(200).json({
        message: 'Image deleted!',
        result
    });
}
