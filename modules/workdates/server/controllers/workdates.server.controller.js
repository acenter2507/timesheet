'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workdate = mongoose.model('Workdate'),
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
