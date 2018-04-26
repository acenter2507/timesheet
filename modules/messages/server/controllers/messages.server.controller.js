'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Message
 */
exports.create = function(req, res) {
  var message = new Message(req.body);
  message.user = req.user;

  message.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(message);
    }
  });
};

/**
 * Show the current Message
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var message = req.message ? req.message.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  message.isCurrentUserOwner = req.user && message.user && message.user._id.toString() === req.user._id.toString();

  res.jsonp(message);
};

/**
 * Update a Message
 */
exports.update = function(req, res) {
  var message = req.message;

  message = _.extend(message, req.body);

  message.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(message);
    }
  });
};

/**
 * Delete an Message
 */
exports.delete = function(req, res) {
  var message = req.message;

  message.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(message);
    }
  });
};

/**
 * List of Messages
 */
exports.list = function(req, res) {
  Message.find().sort('-created').populate('user', 'displayName').exec(function(err, messages) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(messages);
    }
  });
};

/**
 * Message middleware
 */
exports.messageByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Message is invalid'
    });
  }

  Message.findById(id).populate('user', 'displayName').exec(function (err, message) {
    if (err) {
      return next(err);
    } else if (!message) {
      return res.status(404).send({
        message: 'No Message with that identifier has been found'
      });
    }
    req.message = message;
    next();
  });
};
