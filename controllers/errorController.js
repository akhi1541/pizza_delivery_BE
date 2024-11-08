
const AppError = require('../utils/appError');

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errName: err.name,
    err: err,
    stack: err.stack,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(`Error:${err}`);
    res.status(500).json({
      status: 'error',
      message: 'Somthing went wrong!',
    });
  }
};

const handelCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(400, message);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(400, message);
};
const handelValidationError = (err) => {
  const value = Object.values(err.errors).map((ele) => ele.message);
  const message = `Invalid inputs : ${value.join(', ')}`;
  return new AppError(400, message);
};
const handelJsonWebTokenError = () => {
  const message = 'invalid Json Web Token please login agian';
  return new AppError(401, message);
};
const handelTokenExpiredError = () => {
  return new AppError(401, 'JWT is expired please login agian');
};
module.exports = (err, req, res, next) => {
  console.log(err)
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handelCastErrorDb(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    if (err.name === 'ValidationError') {
      error = handelValidationError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handelJsonWebTokenError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handelTokenExpiredError();
    }
    sendErrProd(error, res);
  }
};
