'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  paginate = require('mongoose-paginate'),
  validator = require('validator');

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
  return validator.isEmail(email);
};

var UserSchema = new Schema({
  username: { type: String, unique: 'Username already exists', required: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  firstName: { type: String, trim: true, default: '', required: true },
  lastName: { type: String, trim: true, default: '', required: true },
  displayName: { type: String, trim: true },
  status: { type: Number, default: 1 }, // 1: 働いている, 2: 退職済, 3: 削除
  email: {
    type: String,
    index: {
      unique: true,
      sparse: true
    },
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  private: {
    hobby: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: Number, trim: true },
    sex: { type: Number, default: 1 },
    birthdate: { type: Date },
    introduct: { type: String, trim: true }
  },
  profileImageURL: { type: String, default: 'modules/users/client/img/profile/default.png' },
  department: { type: Schema.ObjectId, ref: 'Department' },
  company: {
    employeeId: { type: String },
    taxId: { type: String },
    salary: { type: Number },
    // 有給休暇の日数
    paidHolidayCnt: { type: Number, default: 0 },
  },
  report: {
    holidayCnt: { type: Number, default: 0 }
  },
  leaders: [
    { type: Schema.ObjectId, ref: 'User' },
  ],
  salt: { type: String },
  roles: {
    type: [{
      type: String,
      enum: ['user', 'accountant', 'manager', 'admin']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  /* For reset password */
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});
UserSchema.plugin(paginate);

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};


UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&@';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return resolve(password);
  });
};

UserSchema.statics.setLeaders = function (departmentId, leaders) {
  return this.update({ department: departmentId, roles: { $ne: 'manager' } }, { $set: { leaders: leaders } }, { multi: true }).exec();
};

UserSchema.statics.removeDepartment = function (departmentId) {
  return this.update({ department: departmentId }, { $set: { department: null, leaders: [] }, }, { multi: true }).exec();
};

mongoose.model('User', UserSchema);
