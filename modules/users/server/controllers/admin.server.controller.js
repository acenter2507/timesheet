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

exports.add = function (req, res) {
  // Verify username
  User.findOne({ username: req.body.username }, function (err, _user) {
    if (_user) return res.status(400).send({ message: 'ユーザーIDが存在しています。' });

    var user = new User(req.body);
    user.displayName = user.firstName + ' ' + user.lastName;
    user.search = user.displayName.toLowerCase() + '-' + user.email.toLowerCase() + '-' + user.username.toLowerCase();
    user.save(function (err) {
      if (err)
        return res.status(400).send({ message: 'ユーザーを保存できません！' });
      // Thêm user vào department
      // var departmentId = user.department ? user.department._id || user.department : undefined;
      // if (departmentId) {
      //   if (_.contains(user.roles, 'manager')) {
      //     Department.addLeader(departmentId, user._id).then(department => {
      //       User.setLeaders(department._id, department.leaders);
      //     });
      //   } else {
      //     Department.addMember(departmentId, user._id).then(department => {
      //       User.setLeaders(department._id, department.leaders);
      //     });
      //   }
      // }
      return res.jsonp(user);
    });
  });
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

  // var departmentId = user.department ? user.department._id || user.department : undefined;
  // if (departmentId) {
  //   if (_.contains(user.roles, 'manager')) {
  //     Department.removeLeader(departmentId, user._id).then(department => {
  //       User.setLeaders(department._id, department.leaders);
  //     });
  //   } else {
  //     Department.removeMember(departmentId, user._id);
  //   }
  // }

  user.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'ユーザーを削除できません！' });
    // TODO
    // Xóa các thông tin liên quan đến user
    return res.end();
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
      { email: { $regex: '.*' + condition.search + '.*' } },
      { email: { $regex: '.*' + key_lower + '.*' } },
      { email: { $regex: '.*' + key_upper + '.*' } },
      { username: { $regex: '.*' + condition.search + '.*' } },
      { username: { $regex: '.*' + key_lower + '.*' } },
      { username: { $regex: '.*' + key_upper + '.*' } },
      { search: { $regex: '.*' + condition.search + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.roles) {
    var roles = _.pluck(condition.roles, 'value');
    if (condition.role) {
      roles = _.union(roles, [condition.role]);
    }

    if (roles.length > 0) {
      and_arr.push({ roles: { $all: roles } });
    }
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  var options = {
    page: page,
    sort: condition.sort,
    limit: condition.limit
  };

  User.paginate(query, options)
    .then(result => {
      return res.jsonp(result);
    }, err => {
      return res.status(400).send({ message: '社員の情報を取得できません！' });
    });
};
exports.resetpass = function (req, res) {
  var user = req.model;
  var newPassword = req.body.newPassword || '';
  if (newPassword === '') {
    return res.status(400).send({ message: '新しいパスワードが無効です。' });
  }
  user.password = newPassword;
  user.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'アカウントを保存できません！' });
    return res.end();
  });
};

exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'アカウントの情報が見つかりません！' });
  }

  User.findById(id, '-salt -password -private')
    .exec(function (err, user) {
      if (err)
        return next(err);
      if (!user)
        return next(new Error('アカウントの情報が見つかりません！'));
      req.model = user;
      return next();
    });
};
