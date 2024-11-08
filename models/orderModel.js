const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: true,
  },
  pizzaItems: [
    {
      pizzaId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pizza',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "delivered"],
    default: "pending",
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
