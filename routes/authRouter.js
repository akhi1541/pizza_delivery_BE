const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

router.route('/register').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgetPassword').post(authController.forgetPassword);
router.route('/resetPassword').post(authController.resetPassword);
router.route('/updatePassword').post(authController.updatePassword);



module.exports = router;