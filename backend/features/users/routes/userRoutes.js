const express = require('express');
const router = express.Router();
const verifyToken=require ('../../middleware/authMiddleware.js');
const userController = require('../controllers/controller.js');
const validate = require('../../middleware/validate.js');
const {verifyRole,updateAuth}=require('../../middleware/authorization.js');

const {
    CompleteUserSchema,
    UpdateUserSchema
} = require('../../../validators/register_validator.js');

router.get('/users',verifyToken,verifyRole('ADMIN'),userController.getAllUsers);
router.get('/users/:id',verifyToken,verifyRole('ADMIN'),userController.getUserById);

router.post(
    '/users',
    validate(CompleteUserSchema),
    userController.createUser
);

//router.put('/users/:id',verifyToken, userController.updateUser);

router.patch(
    '/users/:id',verifyToken,updateAuth,
    validate(UpdateUserSchema),
    userController.PartialUpdateUser
);

router.delete('/users/:id',verifyToken,verifyRole('ADMIN'),userController.deleteUser);


module.exports = router;