'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  User = mongoose.model('User'),
  Department = mongoose.model('Department'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Message
 */
exports.create = function (req, res) {
  getUsers(req.body)
    .then(users => {
      var promises = createPromiseMessages(users, { content: req.body.content });
      return Promise.all(promises);
    })
    .then(messages => {
      messages.forEach(message => {
        var socketUser = _.findWhere(global.onlineUsers, { user: message.to.toString() });
        if (socketUser) {
          global.io.sockets.connected[socketUser.socket].emit('messages');
        }
      });
      res.end();
    })
    .catch(err => {
      res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    });

  function getUsers(data) {
    return new Promise((resolve, reject) => {
      var destination = parseInt(data.destination) || 1;
      if (destination === 1) {
        User.find({ status: 1, roles: { $ne: 'admin' }, _id: { $ne: req.user._id } }).exec(function (err, users) {
          if (err) return reject(err);
          return resolve(users);
        });
      } else if (destination === 2) {
        User.find({ status: 1, roles: { $ne: 'admin', department: { $in: data.departments } } }).exec(function (err, users) {
          if (err) return reject(err);
          return resolve(users);
        });
      } else {
        return resolve(data.users);
      }
    });
  }
  function createPromiseMessages(users, data) {
    var promises = [];
    users.forEach(user => {
      if (user._id === req.user._id) return;
      var message = new Message(data);
      message.to = user._id || user;
      promises.push(message.save());
    });
    return promises;
  }
};

/**
 * Show the current Message
 */
exports.read = function (req, res) {
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
exports.update = function (req, res) {
  var message = req.message;

  message = _.extend(message, req.body);

  message.save(function (err) {
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
exports.delete = function (req, res) {
  var message = req.message;

  message.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      Message.find({ to: req.user._id }).count(function (err, count) {
        if (err) return res.end();
        return res.jsonp(count);
      });
    }
  });
};

/**
 * List of Messages
 */
exports.list = function (req, res) {
  Message.find().sort('-created').populate('user', 'displayName').exec(function (err, messages) {
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
exports.messageByID = function (req, res, next, id) {

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

exports.count = function (req, res) {
  Message.find({ to: req.user._id }).count(function (err, count) {
    if (err) return res.end();
    return res.jsonp(count);
  });
};
exports.clear = function (req, res) {
  Message.remove({ to: req.user._id }, () => {
    res.end();
  });
};