'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Transport = mongoose.model('Transport'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Transport
 */
exports.create = function(req, res) {
  var transport = new Transport(req.body);
  transport.user = req.user;

  transport.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(transport);
    }
  });
};

/**
 * Show the current Transport
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var transport = req.transport ? req.transport.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  transport.isCurrentUserOwner = req.user && transport.user && transport.user._id.toString() === req.user._id.toString();

  res.jsonp(transport);
};

/**
 * Update a Transport
 */
exports.update = function(req, res) {
  var transport = req.transport;

  transport = _.extend(transport, req.body);

  transport.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(transport);
    }
  });
};

/**
 * Delete an Transport
 */
exports.delete = function(req, res) {
  var transport = req.transport;

  transport.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(transport);
    }
  });
};

/**
 * List of Transports
 */
exports.list = function(req, res) {
  Transport.find().sort('-created').populate('user', 'displayName').exec(function(err, transports) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(transports);
    }
  });
};

/**
 * Transport middleware
 */
exports.transportByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Transport is invalid'
    });
  }

  Transport.findById(id).populate('user', 'displayName').exec(function (err, transport) {
    if (err) {
      return next(err);
    } else if (!transport) {
      return res.status(404).send({
        message: 'No Transport with that identifier has been found'
      });
    }
    req.transport = transport;
    next();
  });
};
