const cartModel = require("../models/cartModel");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.addToCart = catchAsync(async (req, res) => {
  const { userId, pizzaId } = req.body;

  let cartItem = await cartModel.findOne({ userId, pizzaId });

  if (cartItem) {
    cartItem.Qty += 1;
    await cartItem.save();
  } else {
    cartItem = await cartModel.create({ userId, pizzaId, Qty: 1 });
  }

  res.status(201).json({
    status: "success added",
    data: cartItem,
  });
});

exports.getCartItems = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const data = await cartModel.aggregate([
    {
      $match: { userId: userId },
    },
    {
      $lookup: {
        from: "pizzas",
        localField: "pizzaId",
        foreignField: "pizzaId",
        as: "pizzaDetails",
      },
    },
    {
      $unwind: "$pizzaDetails",
    },
    {
      $project: {
        itemId: 1,
        userId: 1,
        Qty: 1,
        pizzaId: 1,
        "pizzaDetails.name": 1,
        "pizzaDetails.price": 1,
        "pizzaDetails.description": 1,
        "pizzaDetails.imageUrl": 1,
        "pizzaDetails._id": 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const { userId, itemId, pizzaId, removeItem } = req.body;

  const cartItem = await cartModel.findOne(
    pizzaId ? { userId, pizzaId } : { userId, itemId }
  );

  if (!cartItem) {
    return res.status(404).json({
      status: "fail",
      message: "Item not found in cart",
    });
  }

  if (removeItem || cartItem.Qty === 1) {
    cartItem.Qty = 0;
    await cartModel.deleteOne(
      pizzaId ? { userId, pizzaId } : { userId, itemId }
    );
  } else {
    cartItem.Qty -= 1;
    await cartItem.save();
  }
  res.status(200).json({
    status: "success",
    quantity: cartItem.Qty > 0 && !!cartItem.Qty ? cartItem.Qty : 0,
  });
});
