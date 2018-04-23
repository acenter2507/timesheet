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

/**
 * Create a Workdate
 */
exports.create = function (req, res) {
  var workdate = new Workdate(req.body);
  workdate.user = req.user;

  workdate.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workdate);
    }
  });
};

/**
 * Show the current Workdate
 */
exports.read = function (req, res) {
  Workdate.findById(req.workdate._id)
    .populate('user', 'displayName')
    .populate('workmonth')
    .populate('transfer', 'year month date')
    .populate({
      path: 'workrests',
      populate: { path: 'holiday' }
    })
    .exec(function (err, workdate) {
      if (err || !workdate) {
        return res.status(404).send({
          message: 'エラーになりました！'
        });
      }
      var js_workdate = workdate ? workdate.toJSON() : {};
      js_workdate.isCurrentUserOwner = req.user && workdate.user && workdate.user._id.toString() === req.user._id.toString();
      return res.jsonp(js_workdate);
    });
};

/**
 * Update a Workdate
 */
exports.update = function (req, res) {
  var workdate = req.workdate;

  workdate = _.extend(workdate, req.body);

  workdate.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var workmonthId = workdate.workmonth._id || workdate.workmonth;
      Workmonth.calculatorWorkdates(workmonthId);
      res.jsonp(workdate);
    }
  });
};

/**
 * Delete an Workdate
 */
exports.delete = function (req, res) {
  var workdate = req.workdate;

  workdate.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workdate);
    }
  });
};

/**
 * List of Workdates
 */
exports.list = function (req, res) {
  Workdate.find().sort('-created').populate('user', 'displayName').exec(function (err, workdates) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workdates);
    }
  });
};

/**
 * Lấy danh sách Workrest trong 1 Workdate
 */
exports.workrests = function (req, res) {
  var workdate = req.workdate;
  var promises = [];
  for (let index = 0; index < workdate.workrests.length; index++) {
    const workrestID = workdate.workrests[index]._id || workdate.workrests[index];
    promises.push(Workrest.findById(workrestID).populate('holiday').exec());
  }
  Promise.all(promises)
    .then(workrests => {
      res.jsonp(workrests);
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Workdate middleware
 */
exports.workdateByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Workdate is invalid'
    });
  }

  Workdate.findById(id)
    .populate('user', 'displayName')
    .populate('workmonth')
    .populate({
      path: 'workrests',
      populate: { path: 'holiday' }
    })
    .exec(function (err, workdate) {
      if (err) {
        return next(err);
      } else if (!workdate) {
        return res.status(404).send({
          message: 'No Workdate with that identifier has been found'
        });
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
    for (let index = 0; index <= duration; index++) {
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
    for (let index = 0; index <= duration; index++) {
      var current = start.clone().add(index, 'days');
      promises.push(Workdate.removeWorkrest(workrest._id, current.year(), current.month() + 1, current.date()));
    }
    return Promise.all(promises);
  });
};
// Thêm mới comment vào workdate
exports.addComment = function (req, res) {
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