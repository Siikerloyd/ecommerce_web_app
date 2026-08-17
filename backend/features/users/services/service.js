//import pool
const { object } = require('zod');
const pool = require('../../../config/connect_database.js');
//import hash password function
const HashPasword = require('../../../utils/hash.js');
console.log(HashPasword);
//get all users querry
exports.getAllUsers = async () => {
    const users = await pool.query('select * from users');
    return users;
};
//get user by id 
exports.getUserById = async (user_id) => {
    const user = await pool.query('select* from users where user_id=$1', [user_id]);
    return user;
};

//create new user
exports.createUser = async (user_data) => {
    const HashedPassword = await HashPasword.HashPassword(user_data.password);
    const querry = await pool.query(
        `insert into users(
    first_name, 
    last_name,
    email,
    phone_number,
    password_hash,
    role)
    values($1,$2,$3,$4,$5,$6)`
        , [user_data.first_name, user_data.last_name, user_data.email, user_data.phone_number, HashedPassword, user_data.role]);
    return querry;
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