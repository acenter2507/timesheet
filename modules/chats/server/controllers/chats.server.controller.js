'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Chat = mongoose.model('Chat'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.create = function (req, res) {
  var chat = new Chat(req.body);
  chat.user = req.user;

  chat.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(chat);
    }
  });
};

exports.read = function (req, res) {
  // convert mongoose document to JSON
  var chat = req.chat ? req.chat.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  chat.isCurrentUserOwner = req.user && chat.user && chat.user._id.toString() === req.user._id.toString();

  res.jsonp(chat);
};

exports.update = function (req, res) {
  var chat = req.chat;

  chat = _.extend(chat, req.body);

  chat.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(chat);
    }
  });
};

exports.delete = function (req, res) {
  var chat = req.chat;

  chat.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(chat);
    }
  });
};

exports.list = function (req, res) {
  Chat.find().sort('-created').populate('user', 'displayName').exec(function (err, chats) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(chats);
    }
  });
};

exports.chatByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Chat is invalid'
    });
  }

  Chat.findById(id).populate('user', 'displayName').exec(function (err, chat) {
    if (err) {
      return next(err);
    } else if (!chat) {
      return res.status(404).send({
        message: 'No Chat with that identifier has been found'
      });
    }
    req.chat = chat;
    next();
  });
};

exports.users = function (req, res) {
  var paginate = req.body.paginate;
  User.paginate({ roles: { $ne: 'admin' }, status: 1 }, {
    page: paginate.page,
    limit: paginate.limit,
    select: ('displayName profileImageURL'),
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'ユーザー情報を取得できません！' });
  });
};
exports.load = function (req, res) {
  var room = req.body.room;
  var paginate = req.body.paginate;
  Chat.paginate({ room: room }, {
    page: paginate.page,
    limit: paginate.limit,
    sort: '-created',
    populate: [{ path: 'user', select: 'displayName profileImageURL' }],
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'メッセージの情報を取得できません！' });
  });
};