//imports 
const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');

//get all categories service 
exports.createCategory = async (category) => {
    // Category name
    // Description
    // Parent category ID
    try {
        const query = await pool.query(
            `insert into categories(category_name,description,parent_category_id)
        values($1,$2,$3)returning category_id
        `, [category.category_name, category.description, category.parent_category_id]
        )
        return query.rows[0];
    } catch (error) {
        if (error.code === '23505') {
            throw new AppError("Duplicate category name", 409)
        }
        if (error.code === '23503') {
            throw new AppError("Parent category does not exist", 409);
        }
        throw error;
    }


}


exports.getAllCategories = async () => {
    const query = await pool.query('SELECT * FROM categories');
    return query.rows;
}

exports.getCategoryById = async (cat_id) => {
    const query = await pool.query('select * from categories where category_id=$1', [cat_id]);
    if (query.rows.length === 0) {
        throw new AppError("category id does not exist !", 404);
    }
    return query.rows[0];

}
//category update admin only
exports.UpdateCategory = async (categoryId, data) => {
    // Category name
    // Description
    // Parent category ID
    const fields = Object.keys(data);
    const setParts = [];
    const values = [];
    const allowedFields = ['category_name', 'description', 'parent_category_id'];
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
    })
    values.push(categoryId);
    const query = setParts.join(',');
    try {
        const result = await pool.query(`
            update categories
            set ${query}
            where category_id=$${values.length} RETURNING *
            `, values);
        if (result.rowCount === 0) {
            throw new AppError("category not found !", 404);
        }
        return result.rows[0];


    } catch (error) {
        if (error.code === '23505') {
        throw new AppError("Duplicate category name", 409);
    }

    if (error.code === '23503') {
        throw new AppError("Parent category does not exist", 409);
    }

    throw error;
    }
}

exports.deleteCategoryById = async (id) => {

    try {
        const query = await pool.query(
            'DELETE FROM categories WHERE category_id=$1',
            [id]
        );

        if (query.rowCount === 0) {
            throw new AppError("category was not found!", 404);
        }

    } catch (error) {

        if (error.code === '23503') {
            throw new AppError(
                "Category cannot be deleted because it is being used",
                409
            );
        }

        throw error;
    }
};