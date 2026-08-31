//imports 
const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');
//create new product only admin allowed
exports.createProduct = async (p) => {

    if (!p || Object.keys(p).length === 0) {
        throw new AppError("Please fill in product details", 400);
    }

    const product = {
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: p.price,
        stock_quantity: p.stock_quantity,
        status: p.status,
        category_id: p.category_id,
        brand_id: p.brand_id
    };

    try {

        const query = await pool.query(
            `INSERT INTO products (
                sku,
                name,
                description,
                price,
                stock_quantity,
                status,
                category_id,
                brand_id
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING product_id`,
            [
                product.sku,
                product.name,
                product.description ?? null,
                product.price,
                product.stock_quantity,
                product.status ?? "ACTIVE",
                product.category_id ?? null,
                product.brand_id ?? null
            ]
        );

        return query.rows[0];

    } catch (error) {

        if (error.code === '23505') {
            throw new AppError("SKU already exists", 409);
        }

        if (error.code === '23503') {
            throw new AppError("Category or brand does not exist", 409);
        }

        throw error;
    }
};

//get all products (public)
exports.getAllProducts=async()=>{
    const products =await pool.query('select * from products')
    return products.rows;
}
//get product by id (public)
exports.getProductById=async(id)=>{
    try{
    const query=await pool.query('select * from products where product_id=$1',[id]);
    if(query.rows.length===0){
        throw new AppError("product not found",404);
    };
    return query.rows[0];
    }catch(error){
        if (error.code==='22P02'){
            throw new AppError("Invalid product ID", 400);
        }
        throw error;
    }
    
}
//dynamic product update (admin)
exports.dynamicProductUpdate = async (id, data) => {

    const fields = Object.keys(data);
    const setParts = [];
    const values = [];

    const allowedFields = [
        'sku',
        'name',
        'description',
        'price',
        'stock_quantity',
        'status',
        'category_id',
        'brand_id'
    ];

    if (fields.length === 0) {
        throw new AppError("No fields provided for update", 400);
    }

    fields.forEach((key, index) => {

        if (!allowedFields.includes(key)) {
            throw new AppError(`Field ${key} cannot be updated`, 400);
        }

        const value = data[key];

        setParts.push(`${key}=$${index + 1}`);
        values.push(value);
    });

    values.push(id);

    const query = setParts.join(',');

    try {

        const result = await pool.query(
            `UPDATE products
             SET ${query}
             WHERE product_id=$${values.length}`,
            values
        );

        if (result.rowCount === 0) {
            throw new AppError("Product not found", 404);
        }

        return result;

    } catch (error) {

        if (error.code === '22P02') {
            throw new AppError("Invalid product ID", 400);
        }

        if (error.code === '23505') {
            throw new AppError("SKU already exists", 409);
        }

        if (error.code === '23503') {
            throw new AppError("Category or brand does not exist", 409);
        }

        throw error;
    }
};


//delete product by id (admin)

exports.deleteProductById = async (id) => {

    try {

        const query = await pool.query(
            `DELETE FROM products WHERE product_id = $1`,
            [id]
        );

        if (query.rowCount === 0) {
            throw new AppError("Product not found", 404);
        }

        return query;

    } catch (error) {

        if (error.code === '22P02') {
            throw new AppError("Invalid product ID", 400);
        }

        throw error;
    }
};

exports.searchProducts=async()=>{
    
}