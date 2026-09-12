const pool = require('../../../config/connect_database.js');
const AppError = require('../../../utils/AppError.js');

exports.getAllBrands = async () => {
    const query = await pool.query('select * from brands');
    return query.rows;
}

exports.getBrandById = async (id) => {
    const query = await pool.query('select* from brands where brand_id=$1', [id]);
    if (query.rows.length === 0) {
        throw new AppError("brand id does not exist!", 404);
    }
    return query.rows[0];

}

//update brand admin only
exports.updateBrand = async (id, data) => {
    const fields = Object.keys(data);
    const setParts = [];
    const values = [];

    const allowedFields = ['brand_name', 'logo_url'];

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
        const result = await pool.query(`
            UPDATE brands
            SET ${query}
            WHERE brand_id=$${values.length}
            RETURNING *
        `, values);

        if (result.rowCount === 0) {
            throw new AppError("Brand not found!", 404);
        }

        return result.rows[0];

    } catch (error) {
        if (error.code === '23505') {
            throw new AppError("Duplicate brand name", 409);
        }

        throw error;
    }
};

exports.createBrand = async (data) => {
    try {
        const query = await pool.query(
            `INSERT INTO brands (brand_name, logo_url)
             VALUES ($1, $2)
             RETURNING *`,
            [data.brand_name, data.logo_url]
        );

        return query.rows[0];

    } catch (error) {
        if (error.code === '23505') {
            throw new AppError("Duplicate brand name", 409);
        }

        throw error;
    }
};

exports.deleteBrandById = async (id) => {
    try {
        const query = await pool.query(
            'DELETE FROM brands WHERE brand_id = $1',
            [id]
        );

        if (query.rowCount === 0) {
            throw new AppError("Brand was not found!", 404);
        }

    } catch (error) {
        // If another table references this brand
        if (error.code === '23503') {
            throw new AppError(
                "Brand cannot be deleted because it is being used",
                409
            );
        }

        throw error;
    }
};
