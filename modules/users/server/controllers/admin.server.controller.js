'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
var _ = require('underscore');

/**
 * Add a User
 */
exports.add = function (req, res) {
  // Verify username
  User.findOne({ username: req.body.username }, function (err, _user) {
    if (_user) return res.status(400).send({ message: 'ユーザーIDが存在しています。' });

    var user = new User(req.body);
    user.displayName = user.firstName + ' ' + user.lastName;
    user.save(function (err) {
      if (err) return handleError(err);
      res.jsonp(user);
    });

  });
  function handleError(err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  }
};

/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  //For security purposes only merge these parameters
  user = _.extend(user, req.body);
  user.displayName = user.firstName + ' ' + user.lastName;

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;

  user.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'displayName').exec(function (err, users) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

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

/**
 * Tìm kiếm user với key và list ignore
 */
exports.searchUsers = function (req, res) {
  var key = req.body.key;
  var ignore = req.body.ignores;
  var ignores = [];
  if (ignore.length > 0) {
    ignores = _.map(ignore.split(','), (str) => { return str.trim(); });
  }
  var roles = req.body.roles || [];
  var ands = [{ roles: { $ne: 'admin' } }];
  if (ignores.length > 0) {
    ands.push({ _id: { $nin: ignores } });
  }
  if (roles.length > 0) {
    ands.push({ roles: { $in: roles } });
  }
  if (key && key.length > 0) {
    ands.push({
      $or: [
        { displayName: { $regex: '.*' + key + '.*' } },
        { email: { $regex: '.*' + key + '.*' } }
      ]
    });
  }
  var query = { $and: ands };
  User.find(query).select('displayName email profileImageURL')
    .exec((err, users) => {
      if (err) res.status(400).send(err);
      res.jsonp(users);
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