'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Rest = mongoose.model('Rest'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Rest
 */
exports.create = function(req, res) {
  var rest = new Rest(req.body);
  rest.user = req.user;

  // 有給休暇の日数を確認
  if (rest.duration)

  console.log(req.body);
  console.log(req.user);
  res.status(400).send({ message: 'エラーになりました。' });
  // rest.save(function(err) {
  //   if (err) {
  //     return res.status(400).send({
  //       message: errorHandler.getErrorMessage(err)
  //     });
  //   } else {
  //     res.jsonp(rest);
  //   }
  // });
};

/**
 * Show the current Rest
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var rest = req.rest ? req.rest.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  rest.isCurrentUserOwner = req.user && rest.user && rest.user._id.toString() === req.user._id.toString();

  res.jsonp(rest);
};

/**
 * Update a Rest
 */
exports.update = function(req, res) {
  var rest = req.rest;

  rest = _.extend(rest, req.body);

  rest.save(function(err) {
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
exports.delete = function(req, res) {
  var rest = req.rest;

  rest.remove(function(err) {
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
exports.list = function(req, res) {
  Rest.find().sort('-created').populate('user', 'displayName').exec(function(err, rests) {
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
exports.restByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Rest is invalid'
    });
  }

  Rest.findById(id).populate('user', 'displayName').exec(function (err, rest) {
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
