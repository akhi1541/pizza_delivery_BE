const express = require(`express`)
const router = express.Router()
const cartController = require(`../controllers/cartController`)
const authController = require('../controllers/authController')

router.route('/addToCart').post(authController.protect,cartController.addToCart)
router.route('/removeFromCart').post(authController.protect,cartController.removeFromCart)
router.route('/getCartItems/:userId').get(authController.protect,cartController.getCartItems)

module.exports = router