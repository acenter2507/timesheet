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
  console.log('+++++++++++++++', duration);
  for (var index = 0; index <= duration; index++) {
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
      for (var index = 0; index < workdates.length; index++) {
        const workdate = workdates[index];
        const workrests = arr[index];
        var workrestIds = _.pluck(workrests, '_id');
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
  function isWeekend(date) {
    return date.day() === 0 || date.day() === 6;
  }
};
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
};
exports.update = function (req, res) {
  var workmonth = req.workmonth;

  workmonth = _.extend(workmonth, req.body);
  workmonth.historys.push({ action: 2, comment: '', timing: new Date(), user: workmonth.user });

  workmonth.save(function (err) {
    if (err) {
      return res.status(400).send({ message: '勤務表の情報が見つかりません！' });
    } else {
      return res.jsonp(workmonth);
    }
  });
};
exports.delete = function (req, res) {
  var workmonth = req.workmonth;

  workmonth.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '勤務表を削除できません！' });
    // Xóa bỏ các date đã tạo trong month này
    Workdate.remove({ workmonth: workmonth._id }).exec();
    return res.jsonp(workmonth);
  });
};
exports.list = function (req, res) {
  var year = req.body.year;
  if (!year || year === '') return res.status(400).send({ message: 'リクエスト情報が間違います。' });

  Workmonth.find({ user: req.user._id, year: year })
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
exports.request = function (req, res) {
  var workmonth = req.workmonth;
  // Kiểm tra người gửi request chính chủ
  if (req.user._id.toString() !== workmonth.user._id.toString()) {
    return res.status(400).send({ message: '勤務表の申請は本人が必要になります！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (workmonth.status !== 1 && workmonth.status !== 4) {
    return res.status(400).send({ message: '勤務表の状態で申請できません！' });
  }
  workmonth.status = 2;
  workmonth.historys.push({ action: 3, timing: new Date(), user: workmonth.user });
  workmonth.save((err, workmonth) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

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
exports.cancel = function (req, res) {
  var workmonth = req.workmonth;
  // Kiểm tra người gửi request chính chủ
  if (req.user._id.toString() !== workmonth.user._id.toString()) {
    return res.status(400).send({ message: '勤務表の申請のキャンセルは本人が必要になります！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (workmonth.status !== 2) {
    return res.status(400).send({ message: '勤務表の状態でキャンセルできません！' });
  }

  workmonth.status = 1;
  workmonth.historys.push({ action: 6, timing: new Date(), user: workmonth.user });
  workmonth.save((err, workmonth) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });

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
exports.requestDelete = function (req, res) {
  var workmonth = req.workmonth;
  // Kiểm tra người gửi cancel chính chủ
  if (req.user._id.toString() !== workmonth.user._id.toString()) {
    return res.status(400).send({ message: '勤務表の取り消し申請は本人が必要になります！' });
  }
  // Kiểm tra trạng thái của workmonth
  if (workmonth.status !== 3) {
    return res.status(400).send({ message: '勤務表の状態で取り消し申請できません！' });
  }
  workmonth.status = 5;
  workmonth.historys.push({ action: 7, timing: new Date(), user: req.user._id });
  workmonth.save((err, workmonth) => {
    if (err)
      return res.status(400).send({ message: '清算表の状態を変更できません！' });

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
exports.workmonthByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: '勤務表情報が見た借りません。' });
  }

  Workmonth.findById(id)
    .populate('user', 'displayName profileImageURL roles')
    .exec(function (err, workmonth) {
      if (err) {
        return next(err);
      } else if (!workmonth) {
        return res.status(404).send({ message: '勤務表情報が見た借りません。' });
      }
      req.workmonth = workmonth;
      next();
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
