const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const userRouter = require("./routes/authRouter");
const pizzaRouter = require("./routes/pizzaRouter");
const orderRouter = require("./routes/orderRouter");
const CartRouter = require("./routes/cartRouter");
const app = express();
dotenv.config();
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/pizzas", pizzaRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/cart", CartRouter);
app.all("*", (req, res, next) => {
  const err = new AppError(404, `cant't find ${req.originalUrl} on this page`);
  next(err);
});
app.use(globalErrorHandler);
module.exports = app;
