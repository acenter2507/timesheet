'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  Department = mongoose.model('Department'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  _ = require('underscore');

/**
 * Create a Department
 */
exports.create = function (req, res) {
  var department = new Department(req.body);
  department.user = req.user;

  department.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(department);
    }
  });
};

/**
 * Show the current Department
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var department = req.department ? req.department.toJSON() : {};
  department.isCurrentDepartmentLeader = _.contains(_.pluck(department.leaders, '_id'), req.user._id.toString());
  department.isCurrentDepartmentMember = _.contains(_.pluck(department.members, '_id'), req.user._id.toString());
  res.jsonp(department);
};

/**
 * Update a Department
 */
exports.update = function (req, res) {
  var department = req.department;
  // Nếu thông tin update tồn tại avatar mới thì xóa file cũ đi
  if (req.body.avatar && department.avatar !== req.body.avatar) {
    if (department.avatar.indexOf('gallerys') < 0) {
      fs.unlink(path.resolve(department.avatar));
    }
  }

  department = _.extend(department, req.body);

  department.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(department);
    }
  });
};

/**
 * Delete an Department
 */
exports.delete = function (req, res) {
  var department = req.department;

  department.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      User.removeDepartment(department._id);
      res.jsonp(department);
    }
  });
};

/**
 * List of Departments
 */
exports.list = function (req, res) {
  Department.find()
    .sort('-created')
    .populate('members', 'displayName email profileImageURL')
    .populate('leaders', 'displayName email profileImageURL')
    .exec(function (err, departments) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(departments);
      }
    });
};

/**
 * Change department avatar
 */
exports.avatar = function (req, res) {
  var user = req.user;
  var upload = multer(config.uploads.departmentAvatar).single('departmentAvatar');
  var departmentAvatarFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  upload.fileFilter = departmentAvatarFilter;
  if (!user) return res.status(400).send({ message: '権限がありません。' });
  upload(req, res, function (uploadError) {
    if (uploadError) return res.status(400).send({ message: 'アップロードできません。' });
    var imageUrl = config.uploads.departmentAvatar.dest + req.file.filename;
    return res.jsonp(imageUrl);
  });
};


/**
 * Department middleware
 */
exports.departmentByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Department is invalid'
    });
  }

  Department.findById(id)
    .populate('members', 'displayName email profileImageURL')
    .populate('leaders', 'displayName email profileImageURL')
    .exec(function (err, department) {
      if (err) {
        return next(err);
      } else if (!department) {
        return res.status(404).send({
          message: 'No Department with that identifier has been found'
        });
      }
      req.department = department;
      next();
    });
};

/**
 * Delete user from department
 */
exports.removeUser = function (req, res) {
  var userId = req.body.userId;
  var department = req.department;

  User.findById(userId).exec((err, user) => {
    if (_.contains(user.roles, 'manager')) {
      // Remove this user from leaders department
      Department.removeLeader(department._id, userId)
        .then(_department => {
          console.log(_department);
          User.setLeaders(department._id, _department.leaders);
        });
    } else {
      Department.removeMember(department._id, userId);
    }
    user.department = undefined;
    user.leaders = [];
    user.save();
    res.end();
  });
};

/**
 * Delete user from department
 */
exports.addUser = function (req, res) {
  var userId = req.body.userId;
  var department = req.department;
  if (!department) return res.status(400).send({ message: '部署が見つかりません。' });
  User.findById(userId).exec((err, user) => {
    if (user.department) return res.status(400).send({ message: user.displayName + 'は既に他の部署に参加しました。' });
    user.department = department._id;
    user.save(err => {
      if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      if (_.contains(user.roles, 'manager')) {
        // Add this user to leaders department
        Department.addLeader(department._id, user._id)
          .then(department => {
            User.setLeaders(department._id, department.leaders);
          });
      } else {
        Department.addMember(department._id, user._id);
      }
      return res.jsonp(user);
    });
  });
};