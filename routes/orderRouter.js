const express = require('express');
const router = express.Router();
const orderController = require("../controllers/orderController");
const authController =require("../controllers/authController");

router.route('/').post(authController.protect,orderController.newOrder)
router.route('/:id').get(authController.protect,orderController.getOrderDetails)
router.route('/user/:userId').get(authController.protect,orderController.getUserOrders)

module.exports=router