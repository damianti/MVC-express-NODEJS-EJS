const express = require('express');

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');

const { isNotAuth, authenticate  } = require( './appMiddlewares.js');
var router = express.Router();

router.get('/',(req, res) => {res.redirect('/login');});
router.get('/login', isNotAuth, loginController.getLogin);
router.post('/login',isNotAuth, authenticate ,loginController.postLogin);
router.get('/register',isNotAuth, registerController.getRegister);
router.post('/register',isNotAuth, registerController.postRegister);
router.get('/register-password',isNotAuth, registerController.getRegisterPassword);
router.post('/register-password',isNotAuth, registerController.postRegisterPassword);

module.exports = router;