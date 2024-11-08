const express = require('express');
const router = express.Router();
const pizzaController = require("../controllers/pizzaController");
const authController =require("../controllers/authController")
router.route('/').post(authController.protect,pizzaController.setAllPizzas)
router.route('/').get(authController.protect,pizzaController.getAllPizzas)
router.route('/:id').get(authController.protect,pizzaController.getPizza)

module.exports=router