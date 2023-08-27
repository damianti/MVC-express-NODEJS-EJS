const express = require('express');
const dashBoardController = require('../controllers/dashBoardController');
const loginController = require('../controllers/loginController');
const restAPiController = require('../controllers/restAPiController');
const { currentUser, isAuth, unauthenticate} = require("./appMiddlewares");


var router = express.Router();
router.get('/',isAuth, currentUser, dashBoardController.getDashBoard);
router.post('/logout',isAuth, unauthenticate, loginController.postLogout);

//rest api routes
router.post('/comments', isAuth,currentUser, restAPiController.postComment)
router.get('/comments', isAuth, currentUser, restAPiController.getComments)
router.delete('/comments/:id', isAuth , currentUser, restAPiController.deleteComment)

module.exports = router;