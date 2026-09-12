const brandServices=require('../services/brandServices.js');

exports.getAllBrands=async(req,res)=>{
    const result=await brandServices.getAllBrands();
    res.status(200).json({message:"this the list of brands we have","brands":result});
}

exports.getBrandById=async(req,res)=>{
    const result =await brandServices.getBrandById(req.params.id);
    res.status(200).json({message:'this is the brand youre looking for',result});
}

exports.updateBrand=async(req,res)=>{
    const id=req.params.id;
    const data=req.body;
    const result=await brandServices.updateBrand(id,data);
    res.status(200).json({message:'brand updated',result});

}

exports.createBrand=async(req,res)=>{
    const brandData=req.body;
    const result=await brandServices.createBrand(brandData);
    res.status(201).json({message:'brand created!',result});
}

exports.deleteBrandById = async (req, res) => {
    await brandServices.deleteBrandById(req.params.id);

    res.status(200).json({
        message: "Brand deleted successfully!"
    });
};