'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Department = mongoose.model('Department'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var _ = require('underscore');

exports.read = function (req, res) {
  User.findById(req.model._id, '-salt -password -private -username')
    .exec(function (err, user) {
      if (err)
        return res.status(400).send({ message: '社員の情報が見つかりません！' });
      return res.jsonp(user);
    });
};
exports.update = function (req, res) {
  var user = req.model;

  delete req.body.roles;
  delete req.body.password;

  console.log(req.body);

  user.status = req.body.status;
  user.company.employeeId = req.body.company.employeeId;
  user.company.taxId = req.body.company.taxId;
  user.company.salary = req.body.company.salary;
  user.company.paidHolidayCnt = req.body.company.paidHolidayCnt;
  user.department = req.body.department;
  
  user.save(function (err, user) {
    if (err)
      return res.status(400).send({ message: '社員の情報を保存できません！' });
    User.findById(user._id, '-salt -password -private -username')
      .exec(function (err, user) {
        if (err)
          return res.status(400).send({ message: '社員の情報が見つかりません！' });
        return res.jsonp(user);
      });
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