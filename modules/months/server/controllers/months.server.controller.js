'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Month = mongoose.model('Month'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Month
 */
exports.create = function(req, res) {
  var month = new Month(req.body);
  month.user = req.user;

  month.save(function(err) {
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
 * Show the current Month
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var month = req.month ? req.month.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  month.isCurrentUserOwner = req.user && month.user && month.user._id.toString() === req.user._id.toString();

  res.jsonp(month);
};

/**
 * Update a Month
 */
exports.update = function(req, res) {
  var month = req.month;

  month = _.extend(month, req.body);

  month.save(function(err) {
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
exports.delete = function(req, res) {
  var month = req.month;

  month.remove(function(err) {
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
exports.list = function(req, res) {
  Month.find().sort('-created').populate('user', 'displayName').exec(function(err, months) {
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
 * Month middleware
 */
exports.monthByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Month is invalid'
    });
  }

  Month.findById(id).populate('user', 'displayName').exec(function (err, month) {
    if (err) {
      return next(err);
    } else if (!month) {
      return res.status(404).send({
        message: 'No Month with that identifier has been found'
      });
    }
    req.month = month;
    next();
  });
};
