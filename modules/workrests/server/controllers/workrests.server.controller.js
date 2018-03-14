'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workrest = mongoose.model('Workrest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Workrest
 */
exports.create = function(req, res) {
  var workrest = new Workrest(req.body);
  workrest.user = req.user;

  workrest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workrest);
    }
  });
};

/**
 * Show the current Workrest
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var workrest = req.workrest ? req.workrest.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  workrest.isCurrentUserOwner = req.user && workrest.user && workrest.user._id.toString() === req.user._id.toString();

  res.jsonp(workrest);
};

/**
 * Update a Workrest
 */
exports.update = function(req, res) {
  var workrest = req.workrest;

  workrest = _.extend(workrest, req.body);

  workrest.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workrest);
    }
  });
};

/**
 * Delete an Workrest
 */
exports.delete = function(req, res) {
  var workrest = req.workrest;

  workrest.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workrest);
    }
  });
};

/**
 * List of Workrests
 */
exports.list = function(req, res) {
  Workrest.find().sort('-created').populate('user', 'displayName').exec(function(err, workrests) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workrests);
    }
  });
};

/**
 * Workrest middleware
 */
exports.workrestByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Workrest is invalid'
    });
  }

  Workrest.findById(id).populate('user', 'displayName').exec(function (err, workrest) {
    if (err) {
      return next(err);
    } else if (!workrest) {
      return res.status(404).send({
        message: 'No Workrest with that identifier has been found'
      });
    }
    req.workrest = workrest;
    next();
  });
};
