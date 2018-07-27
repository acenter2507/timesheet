'use strict';

var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  passport = require('passport'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User');

exports.autocomplete = function (req, res) {
  var condition = req.body.condition || {};

  var ands = [];
  // 基本はシステム管理者を除外
  if (!condition.hasAdmin) {
    ands.push({ roles: { $ne: 'admin' } });
  }
  if (condition.roles.length > 0) {
    ands.push({ roles: { $all: condition.roles } });
  }
  // 部署が未設定のみ
  if (condition.noDepartment) {
    and_arr.push({
      $or: [
        { departments: null },
        { departments: { $exists: false } },
        { departments: { $exists: true, $size: 0 } }
      ]
    });
  }

  if (condition.key && condition.key.length > 0) {
    var key_lower = condition.key.toLowerCase();
    var key_upper = condition.key.toUpperCase();
    var or_arr = [
      { email: { $regex: '.*' + condition.key + '.*' } },
      { email: { $regex: '.*' + key_lower + '.*' } },
      { email: { $regex: '.*' + key_upper + '.*' } },
      { username: { $regex: '.*' + condition.key + '.*' } },
      { username: { $regex: '.*' + key_lower + '.*' } },
      { username: { $regex: '.*' + key_upper + '.*' } },
      { search: { $regex: '.*' + condition.key + '.*' } },
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
exports.update = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  var user = req.user;
  user.private = req.body.private;
  user.updated = Date.now();
  user.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'プロファイルを保存できません！' });
    user.password = undefined;
    user.salt = undefined;
    user.company = undefined;
    user.report = undefined;
    req.login(user, function (err) {
      if (err)
        return res.status(400).send({ message: 'ユーザー認証が失敗しました！' });
      return res.json(user);
    });
  });
};
exports.password = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  var passwordDetails = req.body;

  if (!passwordDetails.newPassword)
    return res.status(400).send({ message: '新しいパスワードを入力してください！' });
  User.findById(req.user._id, function (err, user) {
    if (err || !user)
      return res.status(400).send({ message: 'ユーザー情報が見つかりません！' });

    if (user.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword !== passwordDetails.verifyPassword)
        return res.status(422).send({ message: '確認パスワードと新しいパスワードが統一していません！' });

      user.password = passwordDetails.newPassword;
      user.save(function (err) {
        if (err)
          return res.status(422).send({ message: 'パスワードを保存できません！' });

        user.password = undefined;
        user.salt = undefined;
        user.company = undefined;
        user.report = undefined;

        req.login(user, function (err) {
          if (err) return res.status(400).send(err);
          return res.end();
        });
      });
    } else {
      return res.status(422).send({ message: '現在のパスワードが間違います！' });
    }

  });

};
exports.picture = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('profileUpload');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  upload.fileFilter = profileUploadFileFilter;

  upload(req, res, function (uploadError) {
    if (uploadError) return res.status(400).send({ message: '画像をアップロードできません。' });
    user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;
    user.save(function (err) {
      if (err)
        return res.status(400).send({ message: 'プロファイルを保存できません！' });
      user.password = undefined;
      user.salt = undefined;
      user.company = undefined;
      user.report = undefined;
      req.login(user, function (err) {
        if (err)
          return res.status(400).send({ message: 'ユーザー認証が失敗しました！' });
        return res.json(user);
      });
    });
  });
};
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) return res.status(400).send(info);
    // Remove sensitive data before login

    user.password = undefined;
    user.salt = undefined;
    user.company = undefined;
    user.report = undefined;
    req.login(user, function (err) {
      if (err) return res.status(400).send(err);
      return res.json(user);
    });
  })(req, res, next);
};
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};
exports.profile = function (req, res) {
  if (!req.model) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  User.findById(req.model._id, '-salt -password -roles -username -company -report')
    .populate('departments', 'name')
    .exec(function (err, user) {
      if (err)
        return res.status(400).send({ message: '社員の情報が見つかりません！' });

      user = user.toJSON();
      if (!user.private.public_birthdate) user.private.birthdate = undefined;
      if (!user.private.public_hobby) user.private.hobby = undefined;
      if (!user.private.public_address) user.private.address = undefined;
      if (!user.private.public_phone) user.private.phone = undefined;
      if (!user.private.public_sex) user.private.sex = undefined;
      if (!user.private.public_intro) user.private.intro = undefined;
      return res.jsonp(user);
    });
};