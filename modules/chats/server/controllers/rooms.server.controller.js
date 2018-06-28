'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Room = mongoose.model('Room'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Room
 */
exports.create = function (req, res) {
  var room = new Room(req.body);
  room.save(function (err) {
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
exports.read = function (req, res) {
  Room.findById(req.room._id)
    .populate('users', 'displayName profileImageURL')
    .exec((err, room) => {
      if (err)
        return res.status(400).send({ message: 'チャットのルームが見つかりません！' });
      return res.jsonp(room);
    });
};

/**
 * Update a Room
 */
exports.update = function (req, res) {
  var room = req.room;

  room = _.extend(room, req.body);

  room.save(function (err) {
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
exports.delete = function (req, res) {
  var room = req.room;

  room.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(room);
    }
  });
};

exports.list = function (req, res) {
  Room.find().sort('-created').populate('user', 'displayName').exec(function (err, rooms) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rooms);
    }
  });
};

exports.roomByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'リクエストの情報が見つかりません！' });
  }

  Room.findById(id)
    .exec(function (err, room) {
      if (err) {
        return next(err);
      } else if (!room) {
        return res.status(404).send({ message: 'チャットルームが見つかりません！' });
      }
      req.room = room;
      next();
    });
};
exports.load = function (req, res) {
  var condition = req.body.condition;
  Room.paginate({ users: condition.user, started: 2 }, {
    page: condition.paginate.page,
    limit: condition.paginate.limit,
    sort: '-updated',
    populate: [{ path: 'users', select: 'displayName profileImageURL' }],
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'チャットグループを取得できません！' });
  });
};
exports.privateRoom = function (req, res) {
  var user = req.body.user;
  Room.findOne({ kind: 1, users: user })
    .exec((err, room) => {
      if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
      if (room) return res.jsonp(room);

      var _room = new Room({
        users: [req.user._id, user],
        kind: 1,
        user: req.user._id
      });
      _room.save(function (err) {
        if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
        return res.jsonp(_room);
      });

    });
};