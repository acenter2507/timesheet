'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  _ = require('underscore');

exports.reviews = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var query = {};
  var and_arr = [];
  if (condition.year) {
    and_arr.push({ year: condition.year });
  }
  if (condition.month) {
    and_arr.push({ month: condition.month });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (condition.roles && condition.roles.length > 0) {
    and_arr.push({ roles: condition.roles });
  }

  if (condition.users) {
    var userIds = _.pluck(condistion.users, '_id');
    if (userIds.length > 0) {
      and_arr.push({ user: { $in: userIds } });
    }
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  Payment.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'user', select: 'profileImageURL displayName' },
      {
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      },
    ],
    limit: condition.limit
  }).then(function (payments) {
    return res.jsonp(payments);
  }, err => {
    return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
  });
};
exports.approve = function (req, res) {
  res.end();
};
exports.reject = function (req, res) {
  res.end();
};
