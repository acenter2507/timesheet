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

/**
 * Create a Workmonth
 */
exports.create = function (req, res) {
  var workmonth = new Workmonth(req.body);
  workmonth.user = req.user;

  var workdates = [];

  // Tạo các ngày làm việc trong tháng
  var current = _m().year(workmonth.year).month(workmonth.month - 1).startOf('month');
  var startDate = current.clone().subtract(1, 'months').date(21);
  var endDate = current.clone().date(20);
  var duration = endDate.diff(startDate, 'days');

  var promises = [];
  for (let index = 0; index <= duration; index++) {
    var date = startDate.clone().add(index, 'days');
    var workdate = new Workdate({
      workmonth: workmonth._id,
      year: date.year(),
      month: date.month() + 1,
      date: date.date(),
      day: date.day(),
      isHoliday: isWeekend(date) || jh.isHoliday(new Date(date.format('YYYY/MM/DD'))),
      user: workmonth.user._id || workmonth.user
    });

    workdates.push(workdate);
    // Lấy danh sách những ngày nghỉ đã đăng ký
    promises.push(getWorkrestsForWorkdate(workdate));
  }

  Promise.all(promises)
    .then(arr => {
      var _promises = [];
      for (let index = 0; index < workdates.length; index++) {
        const workdate = workdates[index];
        const workrests = arr[index];
        let workrestIds = _.pluck(workrests, '_id');
        workdate.workrests = workrestIds;
        _promises.push(workdate.save());
      }
      return Promise.all(_promises);
    })
    .then(_workdates => {
      workdates = _workdates;
      var workdateIds = _.pluck(workdates, '_id');
      workmonth.workdates = workdateIds;
      if (req.user.department) {
        workmonth.department = req.user.department._id || req.user.department;
      }
      workmonth.roles = req.user.roles;
      workmonth.historys = [{ action: 1, comment: '', timing: new Date(), user: workmonth.user }];
      return workmonth.save();
    })
    .then(_workmonth => {
      return res.jsonp(workmonth);
    })
    .catch(err => {
      Workdate.remove({ workmonth: workmonth._id }).exec();
      return res.status(400).send({
        message: 'エラーで勤務表を作成できません！'
      });
    });
};

/**
 * Show the current Workmonth
 */
exports.read = function (req, res) {
  Workmonth.findById(req.workmonth._id)
    .populate({
      path: 'historys', populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
      ]
    })
    .populate('user', 'displayName roles status profileImageURL')
    .populate({
      path: 'workdates', populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        { path: 'transfer_workdate', model: 'Workdate' },
        {
          path: 'workrests', model: 'Workrest', populate: [
            { path: 'holiday', model: 'Holiday' }
          ]
        },
      ]
    })
    .exec(function (err, workmonth) {
      if (err)
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      return res.jsonp(workmonth);
    });
};

/**
 * Update a Workmonth
 */
exports.update = function (req, res) {
  var workmonth = req.workmonth;

  workmonth = _.extend(workmonth, req.body);

  workmonth.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workmonth);
    }
  });
};

/**
 * Delete an Workmonth
 */
exports.delete = function (req, res) {
  var workmonth = req.workmonth;

  workmonth.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Xóa bỏ các date đã tạo trong month này
      Workdate.remove({ workmonth: workmonth._id }).exec();
      res.jsonp(workmonth);
    }
  });
};

/**
 * Gửi thỉnh cầu
 */
exports.request = function (req, res) {
  var workmonth = req.workmonth;
  workmonth.status = 2;
  workmonth.historys.push({ action: 3, comment: '', timing: new Date(), user: workmonth.user });
  workmonth.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(workmonth);
  });
};

/**
 * Hủy bỏ thỉnh cầu
 */
exports.cancel = function (req, res) {
  var workmonth = req.workmonth;

  if (workmonth.status !== 2) {
    return res.status(400).send({ message: '勤務表の状態は申請中ではありません！' });
  }

  workmonth.status = 1;
  workmonth.historys.push({ action: 6, comment: '', timing: new Date(), user: workmonth.user });
  workmonth.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(workmonth);
  });
};

/**
 * Chấp nhận bản timesheet
 */
exports.approve = function (req, res) {
  var workmonth = req.workmonth;

  workmonth.status = 3;
  workmonth.historys.push({ action: 4, comment: '', timing: new Date(), user: req.user._id });
  workmonth.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: '承認処理が完了できません。' });
    res.jsonp(workmonth);
  });
};

/**
 * Từ chối bản timesheet
 */
exports.reject = function (req, res) {
  var workmonth = req.workmonth;

  workmonth.status = 4;
  workmonth.historys.push({ action: 5, comment: req.body.data.comment, timing: new Date(), user: req.user._id });

  workmonth.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    return res.jsonp(workmonth);
  });
};

/**
 * List of Workmonths
 */
exports.list = function (req, res) {
  Workmonth.find().sort('-created').populate('user', 'displayName').exec(function (err, workmonths) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workmonths);
    }
  });
};

/**
 * Get all month in year of 1 user
 */
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

/**
 * Get all month in year of 1 user
 */
exports.getHolidayWorking = function (req, res) {
  var workmonthId = req.body.workmonthId;
  if (!workmonthId) return res.status(400).send({ message: 'リクエスト情報が間違います。' });

  var condition = {
    $and: [
      { workmonth: workmonthId },
      { isHoliday: { $ne: false } },
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

/**
 * Workmonth middleware
 */
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
  }).then(function (rests) {
    res.jsonp(rests);
  }, err => {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};
