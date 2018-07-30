'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var _ = require('underscore');

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
      return res.jsonp(user);
    });
  });
};
exports.read = function (req, res) {
  var model = req.model;
  model.company = undefined;
  model.private = undefined;
  res.json(model);
};
exports.update = function (req, res) {
  var user = req.model;

  delete req.body.departments;
  delete req.body.password;

  user.email = req.body.email;
  user.roles = req.body.roles;
  user.username = req.body.username;
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.displayName = user.firstName + ' ' + user.lastName;
  user.search = user.displayName.toLowerCase() + '-' + user.email.toLowerCase() + '-' + user.username.toLowerCase();
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    user.company = undefined;
    user.private = undefined;
    res.json(user);
  });
};
exports.delete = function (req, res) {
  var user = req.model;
  user.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'ユーザーを削除できません！' });
    // TODO Xóa các thông tin liên quan đến user
    // 部署メンバーを更新
    for (let i = 0; i < user.departments.length; i++) {
      var dep = user.departments[i];
      Department.removeMember(dep, user._id);
    }
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

  User.findById(id, '-salt -password')
    .exec(function (err, user) {
      if (err)
        return next(err);
      if (!user)
        return next(new Error('アカウントの情報が見つかりません！'));
      req.model = user;
      return next();
    });
};
