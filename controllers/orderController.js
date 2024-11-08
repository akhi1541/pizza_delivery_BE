const orderModel = require("../models/orderModel");
const catchAsync = require("../utils/catchAsync");
exports.newOrder = catchAsync(async (req, res, next) => {
  const placedOrder = await orderModel.create(req.body);
  res.status(200).json({
    status: "success",
    results: placedOrder.length,
    data: { placedOrder },
  });
});

exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const orderDetails = await orderModel.findById(req.parms.id);
  res.status(200).json({
    status: "success",
    results: orderDetails.length,
    data: { orderDetails },
  });
});
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orderDetails = await orderModel.find({ userId: req.params.userId });
  res.status(200).json({
    status: "success",
    results: orderDetails.length,
    data: { orderDetails },
  });
});

