const express = require('express');
const router = express.Router();
const verifyToken=require('../../middleware/authMiddleware.js');
const AuthController=require('../controllers/authcontroller.js');
const GenerateToken=require('../../../utils/jwt.js');
router.post('/login',AuthController.login);
router.get('/me', verifyToken, AuthController.me);
router.post('/logout', AuthController.logout);
module.exports=router;