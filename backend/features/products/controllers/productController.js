const product_services=require("../services/productServices.js");
//const AppError=require("../../../utils/AppError.js");
exports.createProduct=async(req,res)=>{
    const product=req.body;
    const result=await product_services.createProduct(product);
    res.status(201).json({"message":"product created","product id":result.product_id});
}

exports.getAllProducts=async(req,res)=>{
    const result =await product_services.getAllProducts();
    res.status(200).json({result});
}

exports.getProductById=async (req,res)=>{
    const productId=req.params.id;
    const result = await product_services.getProductById(productId);
    res.status(200).json({'product id':result.product_id,result});

}

exports.dynamicProductUpdate=async(req,res)=>{
    const id=req.params.id;
    const product=req.body;
    const result=await product_services.dynamicProductUpdate(id,product);
    res.status(200).json({'product id':id,message:'product updated sucessfully'});
}


exports.deleteProductById=async(req,res)=>{
    const id=req.params.id;
    const result =await product_services.deleteProductById(id);
    res.status(200).json({"product id":id,message:"product deleted sucessfully"});
}


exports.searchProducts=async(req,res)=>{
    const query=req.query;
    const result=await product_services.searchProducts(query);
    res.status(200).json({result})
}
