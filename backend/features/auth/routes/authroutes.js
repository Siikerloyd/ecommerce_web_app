const express = require('express');
const router = express.Router();
const AuthController=require('../controllers/authcontroller.js');
const GenerateToken=require('../../../utils/jwt.js');
router.post('/login',AuthController.login);
module.exports=router;