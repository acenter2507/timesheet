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

exports.create = function (req, res) {
  var department = new Department(req.body);
  department.user = req.user;

  department.search = department.name + '-' + department.email;
  department.save(function (err) {
    if (err)
      return res.status(400).send({ message: '部署を保存できません！' });
    return res.jsonp(department);
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
exports.update = function (req, res) {
  var department = req.department;
  // Nếu thông tin update tồn tại avatar mới thì xóa file cũ đi
  if (req.body.avatar && department.avatar !== req.body.avatar) {
    if (department.avatar.indexOf('gallerys') < 0) {
      fs.unlink(path.resolve(department.avatar));
    }
  }
  department = _.extend(department, req.body);
  department.search = department.name + '-' + department.email;
  department.save(function (err) {
    if (err) return res.status(400).send({ message: '部署の情報を保存できません！' });
    return res.jsonp(department);
  });
};
exports.delete = function (req, res) {
  var department = req.department;
  department.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '部署を削除できません！' });
    return res.end();
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
exports.removeUser = function (req, res) {
  var userId = req.body.userId;
  var department = req.department;

  User.findById(userId).exec((err, user) => {
    if (_.contains(user.roles, 'manager')) {
      // Remove this user from leaders department
      Department.removeLeader(department._id, userId)
        .then(department => {
          User.setLeaders(department._id, department.leaders);
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
        Department.addMember(department._id, user._id)
          .then(department => {
            User.setLeaders(department._id, department.leaders);
          });
      }
      return res.jsonp(user);
    });
  });
};
