'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Department = mongoose.model('Department'),
  User = mongoose.model('User'),
  _ = require('underscore');

exports.read = function (req, res) {
  User.findById(req.model._id, '-salt -password -private -username')
    .populate('departments', 'name avatar email')
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

  var old_departments = user.departments;
  _.map(old_departments, dep => { return dep.toString(); });
  var new_departments = req.body.departments;
  _.map(new_departments, dep => { return dep.toString(); });
  // 削除された部署
  var removed = _.difference(old_departments, new_departments);
  // 追加された部署
  var added = _.difference(new_departments, old_departments);

  console.log(removed);
  console.log('added', added);
  user.departments = req.body.departments;
  user.status = req.body.status;
  user.company.employeeId = req.body.company.employeeId;
  user.company.taxId = req.body.company.taxId;
  user.company.salary = req.body.company.salary;
  user.company.paidHolidayCnt = req.body.company.paidHolidayCnt;

  user.save(function (err, user) {
    if (err)
      return res.status(400).send({ message: '社員の情報を保存できません！' });
    User.findById(user._id, '-salt -password -private -username')
      .populate('departments', 'name avatar email')
      .exec(function (err, user) {
        if (err)
          return res.status(400).send({ message: '社員の情報が見つかりません！' });
        user.private = undefined;
        // 部署のメンバーを更新する
        removed.forEach(dep => { Department.addMember(dep, user._id); });
        added.forEach(dep => { Department.removeMember(dep, user._id); });
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
      and_arr.push({
        $or: [
          { departments: null },
          { departments: { $exists: false } },
          { departments: { $exists: true, $size: 0 } }
        ]
      });
    } else {
      and_arr.push({ departments: condition.department });
    }
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  var options = {
    page: page,
    sort: condition.sort,
    limit: condition.limit,
    populate: [{ path: 'departments', select: 'name' }]
  };

  User.paginate(query, options)
    .then(result => {
      return res.jsonp(result);
    }, err => {
      return res.status(400).send({ message: '社員の情報を取得できません！' });
    });
};