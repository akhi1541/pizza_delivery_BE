const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cartSchema = new mongoose.Schema({
  itemId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    ref: 'Users',
    required: true,
  },
  pizzaId: {
    type: String,
    ref: 'Pizza',
    required: true
  },
  Qty:{
    type: Number,
    default: 0
  }
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
