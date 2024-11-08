const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const pizzaSchema = new mongoose.Schema({
  pizzaId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: ["small", "medium", "large"],
    required: true,
  },
});

const Pizza = mongoose.model("Pizza", pizzaSchema);

module.exports = Pizza;
