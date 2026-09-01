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
exports.getAllProducts = async () => {
    const products = await pool.query('select * from products')
    return products.rows;
}
//get product by id (public)
exports.getProductById = async (id) => {
    try {
        const query = await pool.query('select * from products where product_id=$1', [id]);
        if (query.rows.length === 0) {
            throw new AppError("product not found", 404);
        };
        return query.rows[0];
    } catch (error) {
        if (error.code === '22P02') {
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

exports.searchProducts = async (query) => {

    const fields = Object.keys(query);

    const conditions = [];
    const values = [];

    const allowedSearchparam = [
        'search',
        'category_id',
        'brand_id',
        'sort',
        'page',
        'limit'
    ];

    const allowedSorts = {
        price_asc: 'price ASC',
        price_desc: 'price DESC',
        name_asc: 'name ASC',
        name_desc: 'name DESC'
    };

    fields.forEach((key) => {

        const value = query[key];

        // Validate parameter name
        if (!allowedSearchparam.includes(key)) {
            throw new AppError(
                `cannot search product using this parameter ${key}`,
                400
            );
        }

        // Validate sort
        if (key === 'sort' && !Object.hasOwn(allowedSorts, value)) {
            throw new AppError("Invalid sort value", 400);
        }

        // Validate IDs and page
        if (key === 'category_id' || key === 'brand_id' || key === 'page') {

            if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
                throw new AppError(
                    `${key} must be a positive integer`,
                    400
                );
            }
        }

        // Validate limit
        if (key === 'limit') {

            if (
                !Number.isInteger(Number(value)) ||
                Number(value) <= 0 ||
                Number(value) > 200
            ) {
                throw new AppError(
                    `${key} must be a positive integer between 1 and 200`,
                    400
                );
            }
        }

        // Validate search
        if (key === 'search' && value.trim().length === 0) {
            throw new AppError("Search cannot be empty", 400);
        }

        // Search
        if (key === 'search') {

            conditions.push(`
                (
                    name ILIKE $${values.length + 1}
                    OR sku ILIKE $${values.length + 1}
                    OR description ILIKE $${values.length + 1}
                )
            `);

            values.push(`%${value}%`);
        }

        // Category
        if (key === 'category_id') {

            conditions.push(
                `category_id = $${values.length + 1}`
            );

            values.push(Number(value));
        }

        // Brand
        if (key === 'brand_id') {

            conditions.push(
                `brand_id = $${values.length + 1}`
            );

            values.push(Number(value));
        }

    });

    // WHERE
    const where = conditions.length
        ? `WHERE ${conditions.join(' AND ')}`
        : '';

    // Pagination
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;

    const offset = (page - 1) * limit;

    // Sorting
    const orderBy = query.sort
        ? `ORDER BY ${allowedSorts[query.sort]}`
        : '';

    // Final query
    const result = await pool.query(
        `
        SELECT *
        FROM products
        ${where}
        ${orderBy}
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
        `,
        [
            ...values,
            limit,
            offset
        ]
    );

    return result.rows;
};