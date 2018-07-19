'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Room = mongoose.model('Room'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Room
 */
exports.create = function(req, res) {
  var room = new Room(req.body);
  room.user = req.user;

  room.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(room);
    }
  });
};

/**
 * Show the current Room
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var room = req.room ? req.room.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  room.isCurrentUserOwner = req.user && room.user && room.user._id.toString() === req.user._id.toString();

  res.jsonp(room);
};

/**
 * Update a Room
 */
exports.update = function(req, res) {
  var room = req.room;

  room = _.extend(room, req.body);

  room.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(room);
    }
  });
};

/**
 * Delete an Room
 */
exports.delete = function(req, res) {
  var room = req.room;

  room.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(room);
    }
  });
};

/**
 * List of Rooms
 */
exports.list = function(req, res) {
  Room.find().sort('-created').populate('user', 'displayName').exec(function(err, rooms) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rooms);
    }
  });
};

/**
 * Room middleware
 */
exports.roomByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Room is invalid'
    });
  }

  Room.findById(id).populate('user', 'displayName').exec(function (err, room) {
    if (err) {
      return next(err);
    } else if (!room) {
      return res.status(404).send({
        message: 'No Room with that identifier has been found'
      });
    }
    req.room = room;
    next();
  });
};
