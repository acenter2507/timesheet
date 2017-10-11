'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Department = mongoose.model('Department'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var _ = require('underscore'),
  _moment = require('moment');

/**
 * Add a User
 */
exports.add = function (req, res) {
  // Verify username
  User.findOne({ username: req.body.username }, function (err, _user) {
    if (_user) return res.status(400).send({ message: 'ユーザーIDが存在しています。' });

    var user = new User(req.body);
    user.displayName = user.firstName + ' ' + user.lastName;
    user.save(function (err) {
      if (err) return handleError(err);
      // Thêm user vào department
      var departmentId = (user.department) ? user.department._id || user.department : undefined;
      if (_.contains(user.roles, 'manager')) {
        Department.addLeader(departmentId, user._id);
      } else {
        Department.addMember(departmentId, user._id);
      }
      res.jsonp(user);
    });

  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;
  //For security purposes only merge these parameters
  user = _.extend(user, req.body);
  user.displayName = user.firstName + ' ' + user.lastName;
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  var departmentId = (user.department) ? user.department._id || user.department : undefined;
  if (_.contains(user.roles, 'manager')) {
    Department.removeLeader(departmentId, user._id);
  } else {
    Department.removeMember(departmentId, user._id);
  }

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'User is invalid'
    });
  }

  User.findById(id, '-salt -password')
    .populate('leaders', 'displayName email profileImageURL')
    .exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return next(new Error('Failed to load user ' + id));
      }

      req.model = user;
      next();
    });
};

/**
 * Tìm kiếm user với key và list ignore
 */
exports.searchUsers = function (req, res) {
  var key = req.body.key;
  var ignore = req.body.ignores;
  var ignores = [];
  if (ignore.length > 0) {
    ignores = _.map(ignore.split(','), (str) => { return str.trim(); });
  }
  var roles = req.body.roles || [];
  var ands = [{ roles: { $ne: 'admin' } }];
  if (ignores.length > 0) {
    ands.push({ _id: { $nin: ignores } });
  }
  if (roles.length > 0) {
    ands.push({ roles: { $in: roles } });
  }
  if (key && key.length > 0) {
    ands.push({
      $or: [
        { displayName: { $regex: '.*' + key + '.*' } },
        { email: { $regex: '.*' + key + '.*' } }
      ]
    });
  }
  var query = { $and: ands };
  User.find(query).select('displayName email profileImageURL')
    .exec((err, users) => {
      if (err) res.status(400).send(err);
      res.jsonp(users);
    });
};

/**
 * Đổi mật khẩu user
 */
exports.changeUserPassword = function (req, res) {
  var user = req.model;
  var newPassword = req.body.newPassword || '';
  if (newPassword === '') {
    return res.status(400).send({ message: '新しいパスワードが無効です。' });
  }
  if (!user) {
    return res.status(400).send({ message: 'ユーザーの情報が見つかりません。' });
  }
  user.password = newPassword;
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.end();
    }
  });
};

/**
 * Đổi roles user
 */
exports.changeUserRoles = function (req, res) {
  var user = req.model;
  if (!user) {
    return res.status(400).send({ message: 'ユーザーの情報が見つかりません。' });
  }

  var oldRoles = user.roles;
  var newRoles = req.body.newRoles || [];
  if (newRoles.length === 0) {
    return res.status(400).send({ message: '役割が無効です。' });
  }

  var diff = _.difference(oldRoles, newRoles);

  if (diff.length === 0)
    return res.status(400).send({ message: '役割が変わりません。' });

  var departmentId = (user.department) ? user.department._id || user.department : undefined;
  if (_.contains(oldRoles, 'manager')) {
    if (!_.contains(newRoles, 'manager')) {
      // Xóa bỏ 1 leader trong department
      if (departmentId) {
        Department.removeLeader(departmentId, user._id);
        Department.addMember(departmentId, user._id);
      }
    }
  } else {
    if (_.contains(newRoles, 'manager')) {
      if (departmentId) {
        Department.removeLeader(departmentId, user._id);
        Department.addMember(departmentId, user._id);
      }
      user.leaders = [];
    }
  }

  user.roles = newRoles;
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.end();
    }
  });
};

/**
 * Đổi roles user
 */
exports.changeUserDepartment = function (req, res) {
  var user = req.model;
  if (!user) {
    return res.status(400).send({ message: 'ユーザーの情報が見つかりません。' });
  }
  // Xóa bỏ user hiện tại ra khỏi department cũ
  var oldDepartmentId = (user.department) ? user.department._id || user.department : undefined;
  if (oldDepartmentId) {
    if (_.contains(user.roles, 'manager')) {
      Department.removeLeader(oldDepartmentId, user._id);
    } else {
      Department.removeMember(oldDepartmentId, user._id);
    }
  }
  // Thay đổi department
  if (!req.body.newDepartment || req.body.newDepartment === '') {
    user.department = null;
  } else {
    user.department = req.body.newDepartment;
  }
  // Lưu user lại
  user.save(function (err) {
    // Có lỗi khi lưu
    if (err) return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    // Xử lý với department mới
    var newDepartmentId = (user.department) ? user.department._id || user.department : undefined;
    if (!newDepartmentId || newDepartmentId === '') return res.end();
    // Thêm user hiện hành vào department mới
    if (_.contains(user.roles, 'manager')) {
      Department.addLeader(req.body.newDepartment, user._id);
      return res.end();
    } else {
      Department.addMember(req.body.newDepartment, user._id);
      Department.findById(req.body.newDepartment)
        .populate('leaders', 'displayName email profileImageURL')
        .exec((err, department) => {
          return res.jsonp(department.leaders);
        });
    }
  });
};
