'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
var validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email));
};

var UserSchema = new Schema({
  username: { type: String, unique: 'Username already exists', required: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  firstName: { type: String, trim: true, default: '', required: true },
  lastName: { type: String, trim: true, default: '', required: true },
  displayName: { type: String, trim: true },
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
    sex: { type: Number, default: 1 },
    birthdate: { type: Date },
    introduct: { type: String }
  },
  profileImageURL: { type: String, default: 'modules/users/client/img/profile/default.png' },
  department: { type: Schema.ObjectId, ref: 'Department' },
  company: {
    employeeId: { type: String },
    taxId: { type: String },
    duty: { type: String },
    salary: { type: Number }
  },
  report: {
    holidayCnt: { type: Number, default: 0 }
  },
  salt: { type: String },
  provider: { type: String, required: 'Provider is required' },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [{
      type: String,
      enum: ['user', 'admin', 'manage', 'vip']
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

mongoose.model('User', UserSchema);
