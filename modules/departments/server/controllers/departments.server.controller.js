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

exports.autocomplete = function (req, res) {
  var condition = req.body.condition || {};
  var query = {};
  var ands = [];

  var key = condition.key;

  if (key && key.length > 0) {
    var key_lower = key.toLowerCase();
    var key_upper = key.toUpperCase();
    var or_arr = [
      { name: { $regex: '.*' + key + '.*' } },
      { name: { $regex: '.*' + key_lower + '.*' } },
      { name: { $regex: '.*' + key_upper + '.*' } },
      { search: { $regex: '.*' + key + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } },
      { email: { $regex: '.*' + key + '.*' } },
      { email: { $regex: '.*' + key_lower + '.*' } },
      { email: { $regex: '.*' + key_upper + '.*' } }
    ];
    ands.push({ $or: or_arr });
  }

  if (ands.length > 0) {
    query = { $and: ands };
  }
  Department.find(query)
    .select('name email avatar')
    .exec((err, departments) => {
      if (err) res.status(400).send(err);
      return res.jsonp(departments);
    });
};
exports.read = function (req, res) {
  Department.findById(req.department._id)
    .populate('members', 'displayName email profileImageURL')
    .exec(function (err, department) {
      if (err || !department)
        return res.status(404).send({ message: '部署が見つかりません！' });
      req.department = department;
      return res.jsonp(department);
    });
};
exports.list = function (req, res) {
  Department.find()
    .sort('-created')
    .populate('members', 'displayName email profileImageURL')
    .exec(function (err, departments) {
      if (err)
        return res.status(400).send({ message: '部署一覧のデータを取得できません！' });
      return res.jsonp(departments);
    });
};
exports.departmentByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send({ message: '部署が見つかりません！' });

  Department.findById(id)
    // .populate('members', 'displayName email profileImageURL')
    .exec(function (err, department) {
      if (err) return next(err);
      if (!department)
        return res.status(404).send({ message: '部署が見つかりません！' });
      req.department = department;
      return next();
    });
};
