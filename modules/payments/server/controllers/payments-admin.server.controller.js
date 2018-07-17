'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
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
    var userIds = _.pluck(condition.users, '_id');
    if (condition.user) {
      userIds = _.union(userIds, [condition.user]);
    }
    if (userIds.length > 0) {
      and_arr.push({ user: { $in: userIds } });
    }
  }

  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  Payment.paginate({
    'User.username': 'lenh'
  }, {
      sort: condition.sort,
      page: page,
      populate: [
        { path: 'user', select: 'profileImageURL displayName' },
        { path: 'department', select: 'name' },
        {
          // match: { age: { $gte: 18 }},
          path: 'historys',
          select: 'action timing user',
          populate: [
            { path: 'user', select: 'displayName profileImageURL', model: 'User' },
          ]
        },
      ],
      limit: condition.limit
    }).then(function (payments) {
      return res.jsonp(payments);
    }, err => {
      console.log(err);
      return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
    });
};
exports.approve = function (req, res) {
  var payment = req.payment;

  if (payment.status !== 2) {
    return res.status(400).send({ message: '清算表の状態で承認できません！' });
  }

  payment.status = 3;
  payment.historys.push({ action: 4, timing: new Date(), user: req.user._id });
  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '承認処理が完了できません。' });
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
  });
};
exports.reject = function (req, res) {
  var payment = req.payment;

  if (payment.status !== 2) {
    return res.status(400).send({ message: '清算表の状態で拒否できません！' });
  }

  payment.status = 4;
  payment.historys.push({ action: 5, timing: new Date(), user: req.user._id });
  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
  });
};
