const express = require('express');
const router = express.Router();

const userController = require('../controllers/controller.js');
const validate = require('../../middleware/validate.js');

const {
    CompleteUserSchema,
    UpdateUserSchema
} = require('../../../validators/register_validator.js');

router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);

router.post(
    '/users',
    validate(CompleteUserSchema),
    userController.createUser
);

router.put('/users/:id', userController.updateUser);

router.patch(
    '/users/:id',
    validate(UpdateUserSchema),
    userController.PartialUpdateUser
);

router.delete('/users/:id', userController.deleteUser);

module.exports = router;