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
  _ = require('lodash');

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
  // convert mongoose document to JSON
  var workdate = req.workdate ? req.workdate.toJSON() : {};
  workdate.isCurrentUserOwner = req.user && workdate.user && workdate.user._id.toString() === req.user._id.toString();

  res.jsonp(workdate);
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
exports.verifyWorkdateWithWorkrest = function (date, workrest) {
  return new Promise((resolve, reject) => {
    var result = {
      problem: false,
      confirm: false,
      warnings: []
    };
    var year = date.year();
    var month = date.month() + 1;
    var date = date.date();
    var workdate;
    Workdate.find({ year: year, month: month, date: date })
      .populate('workrests')
      .populate('workmonth')
      .populate('transfer_workdate')
      .exec()
      .then(workdate => {
        if (!workdate) return resolve(result);
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
            var str = date.format('LL');
            result.warnings.push(str + 'に勤務時間が入力されている。');
          }
        }
        return resolve(result);
      })
      .catch(err => {
        return reject(result);
      });
  });
};