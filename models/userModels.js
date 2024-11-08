const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {v4:uuidv4} = require('uuid')
const userSchema = new mongoose.Schema({
  userId:{
    type:String,
    default:uuidv4,
    unique:true,
    required:true,
    index:true
  },
  username: {
    type: String,
    required: [true, 'name is required'],
  },
  email: {
    type: String,
    required: [true, 'user must have email'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email',
    },
  },
  address:{
    type:String,
    required:[true,'user must have an address']
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    min: [5, 'required minimum 5 characters'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Password is required'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Confirm password must be same as password',
    },
  },
  passwordModifiedAt: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordModifiedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  reqBodyPassword,
  dbPassword
) {
  return await bcrypt.compare(reqBodyPassword, dbPassword);
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
  if (this.passwordModifiedAt) {
    const modifiedTimestamp = parseInt(
      this.passwordModifiedAt.getTime() / 1000,
      10
    );

    //here converts the time stamp in to decimal
    return modifiedTimestamp > timestamp; //100<200
  }
  return false;
};
userSchema.methods.passwordResetTokenGenerate = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); 
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;

};

const UserModel = mongoose.model('Users', userSchema);

module.exports = UserModel;
