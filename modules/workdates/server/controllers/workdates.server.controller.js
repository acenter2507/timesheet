'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workdate = mongoose.model('Workdate'),
  Workmonth = mongoose.model('Workmonth'),
  Workrest = mongoose.model('Workrest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore'),
  _m = require('moment');

exports.read = function (req, res) {
  Workdate.findById(req.workdate._id)
    .populate({
      path: 'workmonth', populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' }
      ]
    })
    .populate('transfers')
    .populate({
      path: 'workrests',
      populate: { path: 'holiday' }
    })
    .exec(function (err, workdate) {
      if (err)
        return res.status(400).send({ message: '勤務時間の情報が見つかりません！' });
      return res.jsonp(workdate);
    });
};
exports.update = function (req, res) {
  var workdate = req.workdate;

  var old_transfers = _.pluck(req.workdate.transfers, '_id');
  var new_transfers = req.body.transfers || [];

  workdate = _.extend(workdate, req.body);

  workdate.save(function (err) {
    if (err)
      return res.status(400).send({ message: '勤務時間を保存できません！' });
    var workmonthId = workdate.workmonth._id || workdate.workmonth;
    Workmonth.calculatorWorkdates(workmonthId)
      .then(() => {
        return Workmonth.updateStatusTransfers(workmonthId);
      })
      .then(() => {
        return res.end();
      });
  });
};
exports.comment = function (req, res) {
  var workdate = req.workdate;
  var comment = req.body.comment;

  workdate.comments.push(comment);
  workdate.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: ('コメントを追加できません！')
      });
    } else {
      res.end();
    }
  });
};

exports.create = function (req, res) {
  res.end();
};
exports.delete = function (req, res) {
  return res.end();
};
exports.list = function (req, res) {
  return res.end();
};
exports.workdateByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: '勤務時間データが見つかりません！' });
  }

  Workdate.findById(id)
    .exec(function (err, workdate) {
      if (err) {
        return next(err);
      } else if (!workdate) {
        return res.status(404).send({ message: '勤務時間データが見つかりません！' });
      }
      req.workdate = workdate;
      next();
    });
};
// Kiểm tra có thể add 1 workrest vào workdate hay không
exports.verifyWorkdateWithWorkrest = function (mDate, workrest) {
  return new Promise((resolve, reject) => {
    var result = {
      problem: false,
      confirm: false,
      warnings: []
    };
    var year = mDate.year();
    var month = mDate.month() + 1;
    var date = mDate.date();
    var workdate;
    Workdate.find({ year: year, month: month, date: date })
      .populate('workrests')
      .populate('workmonth')
      .populate('transfers')
      .exec()
      .then(workdates => {
        if (workdates.length === 0) return resolve(result);
        workdate = workdates[0];
        // Trường hợp đã có 2 workrest trở lên
        if (workdate.workrests.length > 1) {
          result.problem = true;
          result.confirm = false;
          result.warnings.push('二つの休暇が既に申請されましたので休暇を追加できません！');
          return resolve(result);
        }
        // Trường hợp có 1 workrest
        if (workdate.workrests.length === 1) {
          var old_workrest = workdate.workrests[0];
          if (old_workrest.holiday.unit === 1) {
            result.problem = true;
            result.confirm = false;
            result.warnings.push('一日休暇が既に申請されましたので休暇を追加できません！');
            return resolve(result);
          } else {
            if (workrest.holiday.unit === 1) {
              result.problem = true;
              result.confirm = false;
              result.warnings.push('半日休暇が既に申請されましたので休暇を追加できません！');
              return resolve(result);
            }
          }
        }
        // Kiểm tra workmonth đang ở trạng thái gì
        if (workdate.workmonth.status === 2) {
          result.problem = true;
          result.confirm = true;
          result.warnings.push('この日の勤務表が申請されました。');
        }
        // Nếu timesheet đã được approve
        if (workdate.workmonth.status === 3) {
          result.problem = true;
          result.confirm = true;
          result.warnings.push('この日の勤務表が承認されました。');
        }
        // Trường hợp chưa có workrest nào tồn tại thì kiểm tra thời gian đã nhập
        if (workdate.workrests.length === 0 && workrest.holiday.unit === 1) {
          if (workdate.work_duration > 0) {
            result.problem = true;
            result.confirm = true;
            var str = mDate.format('LL');
            result.warnings.push(str + 'に勤務時間が入力されている。');
          }
        }
        return resolve(result);
      }, err => {
        return reject(result);
      });
  });
};
// Add mới 1 workrest vào các workdate liên quan
exports.addWorkrestToWorkdates = function (workrest) {
  return new Promise((resolve, reject) => {
    var start = _m(workrest.start);
    var end = _m(workrest.end);
    var duration = end.diff(start, 'days');
    var promises = [];
    for (var index = 0; index < duration; index++) {
      var current = start.clone().add(index, 'days');
      promises.push(Workdate.addWorkrest(workrest._id, current.year(), current.month() + 1, current.date()));
    }
    return Promise.all(promises);
  });
};
// Xóa 1 workrest khỏi các workdate liên quan
exports.removeWorkrestToWorkdates = function (workrest) {
  return new Promise((resolve, reject) => {
    var start = _m(workrest.start);
    var end = _m(workrest.end);
    var duration = end.diff(start, 'days');
    var promises = [];
    for (var index = 0; index < duration; index++) {
      var current = start.clone().add(index, 'days');
      promises.push(Workdate.removeWorkrest(workrest._id, current.year(), current.month() + 1, current.date()));
    }
    return Promise.all(promises);
  });
};