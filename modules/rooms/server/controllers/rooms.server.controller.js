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
  room.user = req.user;

  room.save(function (err) {
    if (err)
      return res.status(400).send({ message: '会議室を保存できません！' });
    return res.jsonp(room);
  });
};
exports.read = function (req, res) {
  var room = req.room ? req.room.toJSON() : {};
  room.isCurrentUserOwner = req.user && room.user && room.user._id.toString() === req.user._id.toString();
  return res.jsonp(room);
};
exports.update = function (req, res) {
  var room = req.room;

  room = _.extend(room, req.body);
  room.save(function (err) {
    if (err)
      return res.status(400).send({ message: '会議室を保存できません！' });
    return res.jsonp(room);
  });
};
exports.delete = function (req, res) {
  var room = req.room;

  room.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '会議室を削除できません！' });
    return res.jsonp(room);
  });
};
exports.list = function (req, res) {
  Room.find().sort('-created')
    .populate('user', 'displayName').exec(function (err, rooms) {
      if (err)
        return res.status(400).send({ message: '会議室一覧を取得できません！' });
      return res.jsonp(rooms);
    });
};
exports.roomByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: '会議室の情報が見つかりません！' });
  }

  Room.findById(id)
    .populate('user', 'displayName').exec(function (err, room) {
      if (err) return next(err);
      if (!room)
        return res.status(404).send({ message: '会議室の情報が見つかりません！' });
      req.room = room;
      return next();
    });
};
