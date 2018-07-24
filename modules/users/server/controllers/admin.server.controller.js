'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Department = mongoose.model('Department'),
  errorHandler = require(path.resolve(
    './modules/core/server/controllers/errors.server.controller'
  ));
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
    user.search = user.displayName.toLowerCase() + '-' + user.email.toLowerCase() + '-' + user.username.toLowerCase();
    user.save(function (err) {
      if (err) return handleError(err);
      // Thêm user vào department
      var departmentId = user.department ? user.department._id || user.department : undefined;
      if (departmentId) {
        if (_.contains(user.roles, 'manager')) {
          Department.addLeader(departmentId, user._id).then(department => {
            User.setLeaders(department._id, department.leaders);
          });
        } else {
          Department.addMember(departmentId, user._id).then(department => {
            User.setLeaders(department._id, department.leaders);
          });
        }
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
exports.read = function (req, res) {
  res.json(req.model);
};
exports.update = function (req, res) {
  var user = req.model;

  delete req.body.roles;
  delete req.body.department;
  delete req.body.password;
  delete req.body.leaders;

  //For security purposes only merge these parameters
  user = _.extend(user, req.body);
  user.displayName = user.firstName + ' ' + user.lastName;
  user.search = user.displayName.toLowerCase() + '-' + user.email.toLowerCase() + '-' + user.username.toLowerCase();
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    res.json(user);
  });
};
exports.delete = function (req, res) {
  var user = req.model;

  var departmentId = user.department ? user.department._id || user.department : undefined;
  if (departmentId) {
    if (_.contains(user.roles, 'manager')) {
      Department.removeLeader(departmentId, user._id).then(department => {
        User.setLeaders(department._id, department.leaders);
      });
    } else {
      Department.removeMember(departmentId, user._id);
    }
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
exports.list = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var query = {};
  var and_arr = [];

  if (condition.search && condition.search !== '') {
    var key_lower = condition.search.toLowerCase();
    var key_upper = condition.search.toUpperCase();
    var or_arr = [
      { search: { $regex: '.*' + condition.search + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (condition.roles) {
    and_arr.push({ roles: { $in: condition.roles } });
  }
  if (condition.department) {
    and_arr.push({ department: condition.department });
  }

  var options = {
    page: page,
    sort: condition.sort,
    limit: condition.limit,
    populate: [{ path: 'department', select: 'name' }]
  };

  User.paginate(query, options).then(
    result => {
      return res.jsonp(result);
    },
    err => {
      return res.status(400).send({ message: '社員の情報を取得できません！' });
    }
  );
};
exports.searchUsers = function (req, res) {
  var condition = req.body.condition || {};
  var key = condition.key;
  var roles = condition.roles || [];
  var department = condition.department || false;

  var ands = [{ roles: { $ne: 'admin' } }];
  if (roles.length > 0) {
    ands.push({ roles: roles });
  }
  if (department) {
    ands.push({ $or: [{ department: null }, { department: { $exists: false } }] });
  }

  if (key && key.length > 0) {
    var key_lower = key.toLowerCase();
    var key_upper = key.toUpperCase();
    var or_arr = [
      { search: { $regex: '.*' + key + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } }
    ];

    ands.push({ $or: or_arr });
  }

  var query = { $and: ands };
  User.find(query)
    .select('displayName email profileImageURL roles')
    .exec((err, users) => {
      if (err) return res.status(400).send(err);
      return res.jsonp(users);
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

  if (arraysEqual(oldRoles, newRoles))
    return res.status(400).send({ message: '役割が変わりません。' });

  user.roles = newRoles;
  var departmentId = user.department ? user.department._id || user.department : undefined;
  if (departmentId) {
    if (_.contains(newRoles, 'manager')) {
      Department.addLeader(departmentId, user._id)
        .then(department => {
          return Department.removeMember(departmentId, user._id);
        }, handleError)
        .then(department => {
          return User.setLeaders(department._id, department.leaders);
        }, handleError)
        .then(result => {
          user.leaders = [];
          return user.save();
        }, handleError)
        .then(_user => {
          return res.jsonp(_user.leaders);
        }, handleError);
    } else {
      var department;
      Department.removeLeader(departmentId, user._id)
        .then(_department => {
          department = _department;
          return Department.addMember(department._id, user._id);
        }, handleError)
        .then(_department => {
          user.leaders = department.leaders;
          return User.setLeaders(department._id, department.leaders);
        }, handleError)
        .then(result => {
          return user.save();
        }, handleError)
        .then(_user => {
          Department.findById(department._id)
            .populate('leaders', 'displayName email profileImageURL')
            .exec((err, _department) => {
              return res.jsonp(_department.leaders);
            });
        }, handleError);
    }
  } else {
    user.save(err => {
      if (err)
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      return res.jsonp(user.leaders);
    });
  }

  function handleError(err) {
    return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
  }
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
  var oldDepartmentId = user.department ? user.department._id || user.department : undefined;
  if (oldDepartmentId) {
    if (_.contains(user.roles, 'manager')) {
      Department.removeLeader(oldDepartmentId, user._id).then(department => {
        User.setLeaders(department._id, department.leaders);
      });
    } else {
      Department.removeMember(oldDepartmentId, user._id);
    }
  }
  // Thay đổi department
  if (!req.body.newDepartment || req.body.newDepartment === '') {
    user.department = null;
    user.leaders = [];
  } else {
    user.department = req.body.newDepartment;
  }
  // Lưu user lại
  user.save(function (err) {
    // Có lỗi khi lưu
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    // Xử lý với department mới
    var newDepartmentId = user.department ? user.department._id || user.department : undefined;
    if (!newDepartmentId || newDepartmentId === '') return res.end();
    // Thêm user hiện hành vào department mới
    if (_.contains(user.roles, 'manager')) {
      Department.addLeader(
        req.body.newDepartment,
        user._id
      ).then(department => {
        User.setLeaders(department._id, department.leaders);
      });
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

/**
 * Đổi roles user
 */
exports.clearDeletedUsers = function (req, res) {
  User.remove({ status: 3 }).exec(err => {
    res.end();
  });
};

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

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
    .populate('department', 'name')
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