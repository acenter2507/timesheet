'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Room = mongoose.model('Room'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.create = function (req, res) {
  var room = new Room(req.body);
  room.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを保存できません！' });
    Room.populate(room, { path: 'users', select: 'displayName profileImageURL' }, (err, room) => {
      return res.jsonp(room);
    });
  });
};

exports.read = function (req, res) {
  Room.findById(req.room._id)
    .populate('users', 'displayName profileImageURL')
    .populate('user', 'displayName profileImageURL')
    .exec((err, room) => {
      if (err)
        return res.status(400).send({ message: 'チャットのルームが見つかりません！' });
      return res.jsonp(room);
    });
};

exports.update = function (req, res) {
  var room = req.room;
  room = _.extend(room, req.body);
  room.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを保存できません！' });
    return res.jsonp(room);
  });
};

exports.delete = function (req, res) {
  var room = req.room;

  room.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを削除できません！' });
    return res.jsonp(room);
  });
};

exports.load = function (req, res) {
  var condition = req.body.condition;
  Room.paginate({ users: condition.user, started: 2 }, {
    page: condition.paginate.page,
    limit: condition.paginate.limit,
    sort: '-updated',
    populate: [
      { path: 'users', select: 'displayName profileImageURL' },
      { path: 'user', select: 'displayName profileImageURL' }
    ],
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'チャットグループを取得できません！' });
  });
};

exports.privateRoom = function (req, res) {
  var users = [req.body.user, req.user._id];

  Room.findOne(
    {
      $and: [
        { users: req.body.user },
        { users: req.user._id },
        { users: { $size: 2 } },
        { kind: 1 }
      ]
    })
    .exec((err, room) => {
      if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
      if (room) return res.jsonp(room);

      var _room = new Room({
        users: users,
        kind: 1,
        user: req.user._id
      });
      _room.save(function (err) {
        if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
        return res.jsonp(_room);
      });

    });
};

exports.myRoom = function (req, res) {
  Room.findOne(
    {
      $and: [
        { user: req.user._id },
        { users: [req.user._id] },
        { users: { $size: 1 } },
        { kind: 3 }
      ]
    })
    .exec((err, room) => {
      if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
      if (room) return res.jsonp(room);

      var _room = new Room({
        users: [req.user._id],
        kind: 3,
        user: req.user._id
      });
      _room.save(function (err) {
        if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
        return res.jsonp(_room);
      });
    });
};

exports.roomByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send({ message: 'リクエストの情報が見つかりません！' });

  Room.findById(id)
    .exec(function (err, room) {
      if (err) return next(err);
      if (!room)
        return res.status(404).send({ message: 'チャットルームが見つかりません！' });
      req.room = room;
      return next();
    });
};
