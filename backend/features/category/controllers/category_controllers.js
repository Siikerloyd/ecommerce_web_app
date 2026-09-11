const categoryServices=require('../services/category_services.js')
exports.createCategory = async (req, res) => {

    const data = req.body;

    const result = await categoryServices.createCategory(data);

    res.status(201).json({
        "message": "categorie created",
        "categorie id": result.category_id
    });

}

exports.getAllCategories=async(req,res)=>{
    const result= await categoryServices.getAllCategories();
    res.status(200).json({message:"this the list og categories","list":result});
}

exports.getCategoryById=async(req,res)=>{
    const categoryId=req.params.id;
    const result =await categoryServices.getCategoryById(categoryId);
    res.status(200).json({message:"this is the category ur looking for","category id":result});

}
exports.UpdateCategory = async (req, res) => {

    const categoryId = req.params.id;
    const data = req.body;

    const result = await categoryServices.UpdateCategory(categoryId, data);

    res.status(200).json({
        message: 'category updated successfully',
        category: result
    });
};


exports.deleteCategoryById = async (req, res) => {

    const id = req.params.id;

    const result = await categoryServices.deleteCategoryById(id);

    res.status(200).json({
        message: "category deleted successfully !"
    });
};