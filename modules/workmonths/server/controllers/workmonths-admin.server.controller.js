'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workmonth = mongoose.model('Workmonth'),
  Workdate = mongoose.model('Workdate'),
  Workrest = mongoose.model('Workrest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore'),
  _m = require('moment'),
  jh = require('japanese-holidays');

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
  Workmonth.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'workdates' },
      { path: 'user', select: 'profileImageURL displayName' },
      {
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      },
    ],
    // populate: [
    //   { path: 'workdates', select: 'name isPaid' },
    //   { path: 'user', select: 'displayName profileImageURL' },
    //   {
    //     path: 'historys', populate: [
    //       { path: 'user', select: 'displayName profileImageURL', model: 'User' },
    //     ]
    //   },
    // ],
    limit: condition.limit
  }).then(function (workmonths) {
    return res.jsonp(workmonths);
  }, err => {
    return res.status(400).send({ message: 'サーバーでエラーが発生しました！' });
  });
};
exports.approve = function (req, res) {
  var workmonth = req.workmonth;
  // Kiểm tra người gửi request chính chủ
  if (!_.contains(req.user.roles, 'accountant')) {
    return res.status(400).send({ message: '経理部以外はできません！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (workmonth.status !== 2) {
    return res.status(400).send({ message: '勤務表の状態で確認できません！' });
  }

  workmonth.status = 3;
  workmonth.historys.push({ action: 4, timing: new Date(), user: req.user._id });
  workmonth.save((err, workmonth) => {
    if (err)
      return res.status(400).send({ message: '承認処理が完了できません。' });
    Workmonth.findById(workmonth._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName roles status profileImageURL')
      .populate({
        path: 'workdates', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
          { path: 'transfers', model: 'Workdate' },
          {
            path: 'workrests', model: 'Workrest', populate: [
              { path: 'holiday', model: 'Holiday' }
            ]
          },
        ]
      })
      .exec(function (err, workmonth) {
        if (err)
          return res.status(400).send({ message: '勤務表の情報が見つかりません！' });
        return res.jsonp(workmonth);
      });
  });
};
exports.reject = function (req, res) {
  var workmonth = req.workmonth;
  // Kiểm tra người gửi request chính chủ
  if (!_.contains(req.user.roles, 'accountant')) {
    return res.status(400).send({ message: '経理部以外はできません！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (workmonth.status !== 2) {
    return res.status(400).send({ message: '勤務表の状態で拒否できません！' });
  }

  workmonth.status = 4;
  workmonth.historys.push({ action: 5, timing: new Date(), user: req.user._id });

  workmonth.save((err, workmonth) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    Workmonth.findById(workmonth._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName roles status profileImageURL')
      .populate({
        path: 'workdates', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
          { path: 'transfers', model: 'Workdate' },
          {
            path: 'workrests', model: 'Workrest', populate: [
              { path: 'holiday', model: 'Holiday' }
            ]
          },
        ]
      })
      .exec(function (err, workmonth) {
        if (err)
          return res.status(400).send({ message: '勤務表の情報が見つかりません！' });
        return res.jsonp(workmonth);
      });
  });
};