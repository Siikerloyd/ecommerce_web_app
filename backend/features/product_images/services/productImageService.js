const { object } = require('zod');
const pool = require(`../../../config/connect_database.js`);
const AppError = require('../../../utils/AppError.js');

exports.getAllImages = async (productId) => {


    try {
        const checkProduct = await pool.query(`
            select product_id from products 
            where product_id=$1`, [productId]);
        if (checkProduct.rowCount === 0) {
            throw new AppError('product does not exist', 404);
        }
        const query = await pool.query(
            `select * from product_images 
            where product_id=$1
            order by is_primary desc,image_id asc;
        `, [productId]
        )

        return query.rows;
    } catch (error) {
        if (error.code === '22P02') {
            throw new AppError('invalid product!', 400);
        }
        throw error;

    };
}


exports.getImageById = async (productId, imageId) => {
    try {
        const checkProduct = await pool.query(`
            SELECT product_id
            FROM products
            WHERE product_id = $1
        `, [productId]);

        if (checkProduct.rowCount === 0) {
            throw new AppError('product does not exist', 404);
        }

        const query = await pool.query(`
            SELECT *
            FROM product_images
            WHERE product_id = $1
            AND image_id = $2
        `, [productId, imageId]);

        if (query.rowCount === 0) {
            throw new AppError('image does not exist', 404);
        }

        return query.rows[0];

    } catch (error) {
        if (error.code === '22P02') {
            throw new AppError('invalid id !', 400);
        }

        throw error;
    }
};
exports.addImage = async (productId, data) => {
    let client;
    let primary = false;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const checkProduct = await client.query(`
            SELECT product_id
            FROM products
            WHERE product_id = $1
        `, [productId]);

        if (checkProduct.rowCount === 0) {
            throw new AppError('product does not exist', 404);
        }

        const checkPrimary = await client.query(`
            SELECT is_primary
            FROM product_images
            WHERE product_id = $1
            AND is_primary = true
        `, [productId]);

        if (checkPrimary.rowCount === 0) {
            primary = true;
        }

        if (data.is_primary === true) {
            primary = true;
        }

        if (primary) {
            await client.query(`
                UPDATE product_images
                SET is_primary = false
                WHERE product_id = $1
                AND is_primary = true
            `, [productId]);
        }

        const query = await client.query(`
            INSERT INTO product_images
            (product_id, image_url, is_primary)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [productId, data.image_url, primary]);

        await client.query('COMMIT');

        return query.rows[0];

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        if (error.code === '22P02') {
            throw new AppError('invalid product!', 400);
        }

        throw error;

    } finally {
        if (client) {
            client.release();
        }
    }
};



exports.updateImage = async (productId, imageId, data) => {
    const fields = Object.keys(data);
    const allowedFields = ['image_url', 'is_primary'];
    const main = data.is_primary;

    if (fields.length === 0) {
        throw new AppError('no fields provided !', 400);
    }

    const setParts = [];
    const values = [];
    fields.forEach((key) => {
        if (!allowedFields.includes(key)) {
            throw new AppError(`u cant update ${key}`, 400);
        }
        values.push(data[key]);
        setParts.push(`${key}=$${values.length}`);
    });

    const setClause = setParts.join(',');
    // productId / imageId are always the last two params, named for clarity
    const productParamIndex = values.push(productId);
    const imageParamIndex = values.push(imageId);

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // one round trip instead of two: confirms product exists AND
        // that this image belongs to it, and locks the row so concurrent
        // primary-flag updates on the same product can't race each other
        const current = await client.query(
            `select p.product_id, pi.image_id, pi.is_primary
             from products p
             join product_images pi on pi.product_id = p.product_id
             where p.product_id = $1 and pi.image_id = $2
             for update`,
            [productId, imageId]
        );

        if (current.rowCount === 0) {
            // Disambiguate: does the product exist at all?
            const productExists = await client.query(
                `select product_id from products where product_id=$1`,
                [productId]
            );
            if (productExists.rowCount === 0) {
                throw new AppError('product not found !', 404);
            }
            throw new AppError('image not found !', 404);
        }

        // only touch primary-flag bookkeeping if is_primary was actually sent
        if (main !== undefined) {
            const otherMain = await client.query(
                `select image_id from product_images
                 where product_id=$1 and image_id!=$2 and is_primary=true
                 for update`,
                [productId, imageId]
            );

            if (main) {
                if (otherMain.rowCount > 0) {
                    await client.query(
                        `update product_images set is_primary=false
                         where product_id=$1 and image_id!=$2`,
                        [productId, imageId]
                    );
                }
            } else if (otherMain.rowCount === 0) {
                // this was the only primary image — hand it off to the
                // oldest remaining image, or refuse if there isn't one
                const fallback = await client.query(
                    `select image_id from product_images
                     where product_id=$1 and image_id!=$2
                     order by created_at asc limit 1`,
                    [productId, imageId]
                );

                if (fallback.rowCount === 0) {
                    throw new AppError('The only image of a product must remain primary', 400);
                }

                await client.query(
                    `update product_images set is_primary=true where product_id=$1 and image_id=$2`,
                    [productId, fallback.rows[0].image_id]
                );
            }
        }

        const result = await client.query(
            `update product_images set ${setClause}
             where product_id=$${productParamIndex} and image_id=$${imageParamIndex}
             returning *`,
            values
        );

        await client.query('COMMIT');
        return result.rows[0];

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        if (error.code === '22P02') {
            throw new AppError('invalid product or image !', 400);
        }
        throw error;

    } finally {
        if (client) {
            client.release();
        }
    }
};

exports.deleteImageById = async (imageId, productId) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        const current = await client.query(
            `select pi.is_primary
             from products p
             join product_images pi on pi.product_id = p.product_id
             where p.product_id = $1 and pi.image_id = $2
             for update`, [productId, imageId]
        )

        if (current.rowCount === 0) {
            // Disambiguate: does the product exist at all?
            const productExists = await client.query(
                `select product_id from products where product_id=$1`,
                [productId]
            );
            if (productExists.rowCount === 0) {
                throw new AppError('product not found !', 404);
            }
            throw new AppError('image not found !', 404);
        }

        if (current.rows[0].is_primary) {
            const fallback = await client.query(
                `select image_id from product_images
                     where product_id=$1 and image_id!=$2
                     order by created_at asc limit 1`,
                [productId, imageId]
            );

            if (fallback.rowCount > 0) {
                await client.query(
                    `update product_images
                        set is_primary=true
                        where product_id=$1 
                        and image_id=$2`, [productId, fallback.rows[0].image_id]
                );
            }
        }
        const query = await client.query(
            `delete from product_images
                    where product_id=$1 and 
                    image_id=$2 returning *
                    `, [productId, imageId]
        );
        await client.query('COMMIT');
        return query.rows[0];

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        if (error.code === '22P02') {
            throw new AppError('invalid product or image !', 400);
        }
        throw error;


    }finally{
        if(client){
            client.release();
        }
    }

}