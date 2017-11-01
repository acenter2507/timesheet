'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Holiday = mongoose.model('Holiday'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Holiday
 */
exports.create = function(req, res) {
  var holiday = new Holiday(req.body);
  holiday.user = req.user;

  holiday.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(holiday);
    }
  });
};

/**
 * Show the current Holiday
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var holiday = req.holiday ? req.holiday.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  holiday.isCurrentUserOwner = req.user && holiday.user && holiday.user._id.toString() === req.user._id.toString();

  res.jsonp(holiday);
};

/**
 * Update a Holiday
 */
exports.update = function(req, res) {
  var holiday = req.holiday;

  holiday = _.extend(holiday, req.body);

  holiday.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(holiday);
    }
  });
};

/**
 * Delete an Holiday
 */
exports.delete = function(req, res) {
  var holiday = req.holiday;

  holiday.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(holiday);
    }
  });
};

/**
 * List of Holidays
 */
exports.list = function(req, res) {
  Holiday.find().sort('-created').populate('user', 'displayName').exec(function(err, holidays) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(holidays);
    }
  });
};

/**
 * Holiday middleware
 */
exports.holidayByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Holiday is invalid'
    });
  }

  Holiday.findById(id).populate('user', 'displayName').exec(function (err, holiday) {
    if (err) {
      return next(err);
    } else if (!holiday) {
      return res.status(404).send({
        message: 'No Holiday with that identifier has been found'
      });
    }
    req.holiday = holiday;
    next();
  });
};
