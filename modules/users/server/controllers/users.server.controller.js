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

exports.profile = function (req, res) {
  if (!req.user) res.status(400).send({ message: 'ユーザーがログインしていません！' });
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
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;
  var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
  var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = profileUploadFileFilter;

  if (user) {
    upload(req, res, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};
exports.changePassword = function (req, res) {
  // Init Variables
  var passwordDetails = req.body;

  if (req.user) {
    if (passwordDetails.newPassword) {
      User.findById(req.user.id, function (err, user) {
        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              user.save(function (err) {
                if (err) {
                  return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                  });
                } else {
                  req.login(user, function (err) {
                    if (err) {
                      res.status(400).send(err);
                    } else {
                      res.send({
                        message: 'Password changed successfully'
                      });
                    }
                  });
                }
              });
            } else {
              res.status(422).send({
                message: 'Passwords do not match'
              });
            }
          } else {
            res.status(422).send({
              message: 'Current password is incorrect'
            });
          }
        } else {
          res.status(400).send({
            message: 'User is not found'
          });
        }
      });
    } else {
      res.status(422).send({
        message: 'Please provide a new password'
      });
    }
  } else {
    res.status(401).send({
      message: 'User is not signed in'
    });
  }
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
    ands.push({ $or: [{ department: null }, { department: { $exists: false } }] });
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