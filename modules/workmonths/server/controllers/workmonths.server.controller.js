'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workmonth = mongoose.model('Workmonth'),
  Workdate = mongoose.model('Workdate'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Workmonth
 */
exports.create = function (req, res) {
  var workmonth = new Workmonth(req.body);
  workmonth.user = req.user;

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
 * Show the current Workmonth
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var workmonth = req.workmonth ? req.workmonth.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  workmonth.isCurrentUserOwner = req.user && workmonth.user && workmonth.user._id.toString() === req.user._id.toString();

  res.jsonp(workmonth);
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
