//import services
const { id } = require('zod/v4/locales');
const all_users = require('../services/service.js')
//get all users controller
exports.getAllUsers = async (req, res) => {
    try {
        const users = await all_users.getAllUsers();
        res.json(users.rows);
    } catch (error) {
        res.status(500).json({ message: "databse querry failed" });
    };
};
//get user by id
exports.getUserById = async (req, res) => {
    const user_id = req.params.id;
    try {
        const user = await all_users.getUserById(user_id);
        res.json(user.rows);
    } catch (error) {
        res.status(500).json({ message: "database querry failed" });
    };

};
//create a new user 
exports.createUser = async (req, res) => {
    const user_data = req.body;
    console.log(user_data);
    console.log(req.headers["content-type"]);
    try {
        const result = await all_users.createUser(user_data);
        res.json({ message: "user created", data: user_data });
    } catch (error) {
        console.error(error);
        res.json({ message: "failed to create user" });
    }

};

//update user
exports.updateUser = async (req, res) => {
    const data = req.body;
    const user_id = req.params.id;
    console.log(data);
    console.log(req.headers["content-type"]);
    try {
        const result = all_users.updateUser(user_id, data);
        res.json({ message: "user updated", id: user_id });
    } catch (error) {
        console.log(error);
        res.json({ message: "cannot update user" });
    };
};

//delete user
exports.deleteUser = async (req, res) => {
    const user_id = req.params.id;
    try {
        const result = await all_users.deleteUser(user_id);
        res.json({ message: "user deleted succefully", userId: user_id });
    } catch (error) {
        console.log(error);
        res.json({ message: "user was not deleted" });
    }
}


exports.PartialUpdateUser = async (req, res) => {
    const UserId = req.params.id;
    const data = req.body;
    try {
        const result = await all_users.PartialUpdateUser(UserId, data);
        res.json({ "message": "user updated", "user id": UserId })
    } catch (error) {
        console.log(error);
        res.json({ message: "user was not updated" });
    }
};