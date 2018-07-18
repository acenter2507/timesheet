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

exports.getWorkmonthsReview = function (req, res) {
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
  if (condition.department) {
    if (condition.department === 'empty') {
      and_arr.push({ department: null });
    } else {
      and_arr.push({ department: condition.department });
    }
  }
  if (condition.roles && condition.roles.length > 0) {
    and_arr.push({ roles: condition.roles });
  }
  if (condition.user) {
    and_arr.push({ user: condition.user });
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
    res.jsonp(workmonths);
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
  workmonth.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: '承認処理が完了できません。' });
    res.jsonp(workmonth);
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

  workmonth.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    return res.jsonp(workmonth);
  });
};

exports.getMonthsOfYearByUser = function (req, res) {
  var year = req.body.year;
  var userId = req.body.userId;
  if (!year || !userId) return res.status(400).send({ message: 'リクエスト情報が間違います。' });

  Workmonth.find({ user: userId, year: year })
    .populate({
      path: 'historys',
      populate: {
        path: 'user',
        select: 'displayName profileImageURL',
        model: 'User'
      }
    })
    .exec(function (err, workmonths) {
      if (err)
        return res.status(400).send({ message: 'データを取得できません。' });
      return res.jsonp(workmonths);
    });
};

exports.getHolidayWorking = function (req, res) {
  var workmonthId = req.body.workmonthId;
  if (!workmonthId) return res.status(400).send({ message: 'リクエスト情報が間違います。' });

  var condition = {
    $and: [
      { workmonth: workmonthId },
      { isHoliday: true },
      {
        $or: [
          { overtime: { $gt: 0 } },
          { overnight: { $gt: 0 } }]
      }
    ]
  };
  Workdate.find(condition)
    .populate('workmonth', 'year')
    .exec(function (err, workmonths) {
      if (err)
        return res.status(400).send({ message: 'データを取得できません。' });
      return res.jsonp(workmonths);
    });
};

exports.workmonthByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '勤務表情報が見た借りません。'
    });
  }

  Workmonth.findById(id)
    .populate('user', 'displayName')
    .populate('workdates')
    .exec(function (err, workmonth) {
      if (err) {
        return next(err);
      } else if (!workmonth) {
        return res.status(404).send({
          message: '勤務表情報が見た借りません。'
        });
      }
      req.workmonth = workmonth;
      next();
    });
};

function isWeekend(date) {
  return date.day() === 0 || date.day() === 6;
}
// Lấy danh sách ngày nghỉ của 1 ngày làm việc
function getWorkrestsForWorkdate(workdate) {
  return new Promise((resolve, reject) => {
    var date = _m().year(workdate.year).month(workdate.month - 1).date(workdate.date).startOf('date').format();
    Workrest.find({
      $and: [
        { start: { $lte: date } },
        { end: { $gte: date } },
        {
          $or: [
            { status: 3 },
            { status: 5 },
          ]
        }
      ]
    }).exec(function (err, workrests) {
      if (err)
        return reject(err);
      return resolve(workrests);
    });
  });
}
