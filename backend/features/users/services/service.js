//import pool
const { object } = require('zod');
const pool = require('../../../config/connect_database.js');
//import hash password function
const HashPasword = require('../../../utils/hash.js');
//import app error object so we use it when we throw in errors
const AppError = require('../../../utils/AppError.js');
console.log(HashPasword);
//get all users querry
exports.getAllUsers = async () => {
    const users = await pool.query('select * from users');
    return users;
};
//get user by id 
exports.getUserById = async (user_id) => {
    const user = await pool.query('select* from users where user_id=$1', [user_id]);
    if (user.rows.length === 0) {
        throw new AppError('user not found', 404);
    };
    return user.rows[0];
};

//create new user
exports.createUser = async (user_data) => {
    const HashedPassword = await HashPasword.HashPassword(user_data.password);

    try {
        const query = await pool.query(
            `INSERT INTO users(
                first_name,
                last_name,
                email,
                phone_number,
                password_hash,
                role
            )
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING user_id`,
            [
                user_data.first_name,
                user_data.last_name,
                user_data.email,
                user_data.phone_number,
                HashedPassword,
                user_data.role
            ]
        );

        return query.rows[0];

    } catch (error) {

        if (error.code === '23505') {
            throw new AppError("Email already exists", 409);
        }

        throw error;
    }
};

//update user
/*
exports.updateUser = async (user_id, data) => {
    const HashedPassword = await HashPasword.HashPassword(data.password);
    const query = await pool.query(
        `UPDATE users 
         SET first_name=$1,
             last_name=$2,
             email=$3,
             phone_number=$4,
             password_hash=$5,
             role=$6
         WHERE user_id=$7`,
        [
            data.first_name,
            data.last_name,
            data.email,
            data.phone_number,
            HashedPassword,
            data.role,
            user_id
        ]
    );
    return query;
};*/

//delete user
exports.deleteUser = async (user_id) => {
        const delete_query = await pool.query(
            'DELETE FROM users WHERE user_id=$1',
            [user_id]
        );
        if (delete_query.rowCount === 0) {
            throw new AppError("user not found", 404);
        }
        return delete_query;
};


//patch :dynamic partial update 
//remeber to use hashpassword here 
exports.PartialUpdateUser = async (UserId, data) => {
    const fields = Object.keys(data);
    const setParts = [];
    const values = [];
    if (fields.length !== 0) {
        fields.forEach((key, index) => {
            const value = data[key];
            setParts.push(`${key}=$${index + 1}`);
            values.push(value);
        });
        values.push(UserId);
        const querry = setParts.join(',');
        const update_querry = await pool.query(`
        update users
        set ${querry}
        where user_id=$${values.length}`
            , values
        )
        return update_querry;
    } else {
        throw new Error("No fields provided for update");
    }
}


//patch :dynamic partial update 
//remeber to use hashpassword here 
//one more thing avoid modifying this i have no idea how it worked
//hours spent 5 hours
exports.PartialUpdateUser = async (UserId, data) => {

    const fields = Object.keys(data);
    const setParts = [];
    const values = [];
    const allowedFields = [
    'first_name',
    'last_name',
    'email',
    'phone_number'
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

    values.push(UserId);

    const query = setParts.join(',');

    try {

        const update_query = await pool.query(
            `UPDATE users
             SET ${query}
             WHERE user_id=$${values.length}`,
            values
        );

        if (update_query.rowCount === 0) {
            throw new AppError("User not found", 404);
        }

        return update_query;

    } catch (error) {

        if (error.code === '23505') {
            throw new AppError("Email already exists", 409);
        }

        if (error.code === '23503') {
            throw new AppError("Foreign key violation", 409);
        }

        if (error.code === '23502') {
            throw new AppError("NOT NULL violation", 400);
        }

        if (error.code === '23514') {
            throw new AppError("CHECK constraint violation", 400);
        }

        if (error.code === '22P02') {
            throw new AppError("Invalid text representation", 400);
        }

        throw error;
    }
};