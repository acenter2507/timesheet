'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Month = mongoose.model('Month'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Month
 */
exports.create = function (req, res) {
  var month = new Month(req.body);
  month.user = req.user._id;

  Month.findOne({ user: req.user._id, month: month.month, year: month.year }).exec((err, _month) => {
    if (err) return res.status(400).send({ message: 'データが保存できません。' });
    if (_month) return res.status(400).send({ message: 'この月の勤務表が既に作成されました。' });
    month.status = 1;
    month.historys = [{ action: 1, comment: '', timing: month.created, user: month.user }];
    if (req.user.department) {
      month.department = req.user.department._id || req.user.department;
    }
    month.search = req.user.displayName + '勤務表時間' + month.year;
    month.roles = req.user.roles;
    month.save(function (err) {
      if (err) return res.status(400).send({ message: 'データが保存できません。' });
      Month.findById(month._id)
        .populate({
          path: 'historys',
          populate: {
            path: 'user',
            select: 'displayName profileImageURL',
            model: 'User'
          }
        })
        .exec(function (err, _month) {
          return res.jsonp(_month);
        });
    });
  });

};

/**
 * Show the current Month
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  Month.findById(req.month._id)
    .populate({
      path: 'workDates',
      populate: {
        path: 'rest',
        model: 'Rest'
      }
    }).exec(function (error, month) {
      res.jsonp(month);
    });
};

/**
 * Update a Month
 */
exports.update = function (req, res) {
  var month = req.month;

  month = _.extend(month, req.body);

  month.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(month);
    }
  });
};

/**
 * Delete an Month
 */
exports.delete = function (req, res) {
  var month = req.month;

  month.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(month);
    }
  });
};

/**
 * List of Months
 */
exports.list = function (req, res) {
  Month.find().sort('-created').populate('user', 'displayName').exec(function (err, months) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(months);
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

  Month.find({ user: userId, year: year })
    .populate({
      path: 'historys',
      populate: {
        path: 'user',
        select: 'displayName profileImageURL',
        model: 'User'
      }
    })
    .exec(function (err, months) {
      if (err)
        return res.status(400).send({ message: 'データを取得できません。' });
      return res.jsonp(months);
    });
};
/**
 * Month middleware
 */
exports.monthByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '勤務表情報が見た借りません。'
    });
  }

  Month.findById(id)
    .populate('user', 'displayName')
    .populate('workDates')
    .exec(function (err, month) {
      if (err) {
        return next(err);
      } else if (!month) {
        return res.status(404).send({
          message: '勤務表情報が見た借りません。'
        });
      }
      Month.populate(month, {
        path: 'workDates.rests',
        model: 'Rest'
      }, function (err, month) {
        return next(err);
        req.month = month;
        next();
      });
    });
};
