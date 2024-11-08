const userModel = require("../models/userModels");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const loginTo = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECURITY_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};
const createSendToken = (user, statusCode, message, res) => {
  const token = loginTo(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    )
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "sucess",
    token,
    message: message,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await userModel.create({
    username: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    address:req.body.address
  });
  createSendToken(newUser, 200, "user created sucesfully", res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError(400, "please provide email and password"));
  }
  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(400, "email or password"));
  }
  createSendToken(user, 200, "login sucessful", res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError(401, "you are not logged in please login"));
  }
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECURITY_KEY
  );
  if (!decoded) {
    return next(new AppError(401, "jwt verification is failed"));
  }
  const currentUser = await userModel.findOne({ _id: decoded.id });
  if (!currentUser) {
    return next(
      new AppError(401, "The user belong to this token does no longer exists")
    );
  }
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError(401, "password is changed please login agian"));
  }
  req.user = currentUser;
  next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(404, "User not found with given email"));
  }
  const resetToken = user.passwordResetTokenGenerate();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://localhost:3000/api/v1/users/${resetToken}`;
  const message = `this is your reset password url plese click this to  change password ${resetUrl}.If you remember the password just ignore this mail`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token valid for 10min",
      message: message,
    });
    res.status(200).json({
      status: "sucess",
      message: "token has sent to email sucessfully",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        500,
        "There was an error in sending email! Please retry again "
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await userModel.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError(404, "Token is invalid or expired"));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, "password reset sucessfull", res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("+password");
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(
      new AppError(
        403,
        "Given current password is incorrect please check it in order to update the password"
      )
    );
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  createSendToken(user, 200, "password updated sucessfull", res);
});
