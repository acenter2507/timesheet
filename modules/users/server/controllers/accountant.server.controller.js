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

exports.read = function (req, res) {
  res.json(req.model);
  // User.findById(id, '-salt -password')
  //   .exec(function (err, user) {
  //     if (err)
  //       return next(err);
  //     if (!user)
  //       return next(new Error('アカウントの情報が見つかりません！'));
  //     req.model = user;
  //     return next();
  //   });
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
  if (condition.department) {
    if (condition.department === 'empty') {
      and_arr.push({ $or: [{ department: null }, { department: { $exists: false } }] });
    } else {
      and_arr.push({ department: condition.department });
    }
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  var options = {
    page: page,
    sort: condition.sort,
    limit: condition.limit,
    populate: [{ path: 'department', select: 'name' }]
  };

  User.paginate(query, options)
    .then(result => {
      return res.jsonp(result);
    }, err => {
      return res.status(400).send({ message: '社員の情報を取得できません！' });
    });
};

exports.department = function (req, res) {
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