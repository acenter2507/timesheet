'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Rest = mongoose.model('Rest'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Rest
 */
exports.create = function (req, res) {
  var rest = new Rest(req.body);
  rest.user = req.user;

  // 有給休暇の日数を確認
  if (req.body.isPaid && rest.duration > req.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }
  rest.history = [{ action: 1, comment: '', timing: rest.created }];
  if (req.body.isSendWhenSave) {
    rest.status = 2;
    rest.history.push({ action: 2, comment: '', timing: new Date() });
  }
  rest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(rest);
    if (rest.status === 2) {
      // 有給休暇の残日を計算する
      var newHolidayCnt = req.user.company.paidHolidayCnt - rest.duration;
      User.updateHolidays(req.user._id, newHolidayCnt);
      /* TODO */
    }
  });
};

/**
 * Show the current Rest
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var rest = req.rest ? req.rest.toJSON() : {};
  rest.isCurrentUserOwner = req.user && rest.user && rest.user._id.toString() === req.user._id.toString();
  res.jsonp(rest);
};

/**
 * Update a Rest
 */
exports.update = function (req, res) {
  var rest = req.rest;

  rest = _.extend(rest, req.body);

  rest.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rest);
    }
  });
};

/**
 * Delete an Rest
 */
exports.delete = function (req, res) {
  var rest = req.rest;

  rest.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rest);
    }
  });
};

/**
 * List of Rests
 */
exports.list = function (req, res) {
  Rest.find({ user: req.user._id })
    .sort('-created')
    .populate('holiday', 'name isPaid')
    .exec(function (err, rests) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(rests);
      }
    });
};

/**
 * Rest middleware
 */
exports.restByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Rest is invalid'
    });
  }

  Rest.findById(id)
    .populate('user', 'displayName roles leaders profileImageURL email')
    .populate('holiday', 'name isPaid').exec(function (err, rest) {
      if (err) {
        return next(err);
      } else if (!rest) {
        return res.status(404).send({
          message: 'No Rest with that identifier has been found'
        });
      }
      req.rest = rest;
      next();
    });
};
