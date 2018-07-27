'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  paginate = require('mongoose-paginate'),
  relationship = require('mongoose-relationship'),
  validator = require('validator');

var validateLocalStrategyEmail = function (email) {
  return validator.isEmail(email);
};

var UserSchema = new Schema({
  username: { type: String, unique: 'ユーさーIDは既存しています！', required: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  firstName: { type: String, trim: true, default: '', required: true },
  lastName: { type: String, trim: true, default: '', required: true },
  displayName: { type: String, trim: true },
  status: { type: Number, default: 1 }, // 1: 働いている, 2: 退職済
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  profileImageURL: { type: String, default: 'modules/users/client/img/profile/default.png' },
  department: { type: Schema.ObjectId, ref: 'Department', childPath: 'members' },
  roles: {
    type: [{
      type: String,
      enum: ['admin', 'accountant', 'manager', 'user', 'reviewer', 'viewer']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  company: {
    employeeId: { type: String },
    taxId: { type: String },
    salary: { type: Number },
    // 有給休暇の日数
    paidHolidayCnt: { type: Number, default: 10 },
  },
  private: {
    hobby: { type: String, trim: true },
    public_hobby: { type: Boolean, default: false },
    address: { type: String, trim: true },
    public_address: { type: Boolean, default: false },
    phone: { type: Number, trim: true },
    public_phone: { type: Boolean, default: false },
    sex: { type: Number, default: 1 },
    public_sex: { type: Boolean, default: false },
    birthdate: { type: Date },
    public_birthdate: { type: Boolean, default: false },
    intro: { type: String, trim: true },
    public_intro: { type: Boolean, default: false }
  },
  report: {
    holidayCnt: { type: Number, default: 0 }
  },
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  /* For reset password */
  salt: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});
UserSchema.plugin(paginate);
UserSchema.plugin(relationship, { relationshipPathName: 'department' });

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

UserSchema.statics.updateHolidays = function (userId, paidHolidayCnt) {
  return this.findById(userId).exec((err, user) => {
    if (err || !user) return;
    user.company.paidHolidayCnt = paidHolidayCnt;
    return user.save();
  });
};

mongoose.model('User', UserSchema);
