'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Room = mongoose.model('Room'),
  Booking = mongoose.model('Booking'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.create = function (req, res) {
  var booking = new Booking(req.body);
  booking.user = req.user;
  booking.status = 1;

  booking.save(function (err) {
    if (err)
      return res.status(400).send({ message: '予約を保存できません！' });
    return res.end();
  });
};
exports.read = function (req, res) {
  var booking = req.booking ? req.booking.toJSON() : {};
  booking.isCurrentUserOwner = req.user && booking.user && booking.user._id.toString() === req.user._id.toString();
  return res.jsonp(booking);
};
exports.update = function (req, res) {
  var booking = req.booking;

  booking = _.extend(booking, req.body);
  booking.save(function (err) {
    if (err)
      return res.status(400).send({ message: '予約を保存できません！' });
    return res.jsonp(booking);
  });
};
exports.delete = function (req, res) {
  var booking = req.booking;

  booking.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '予約を削除できません！' });
    return res.jsonp(booking);
  });
};
exports.list = function (req, res) {
  Booking.find().sort('-created')
    .populate('user', 'displayName').exec(function (err, bookings) {
      if (err)
        return res.status(400).send({ message: '予約一覧を取得できません！' });
      return res.jsonp(bookings);
    });
};
exports.rooms = function (req, res) {
  var condition = req.body.condition;

  var query = {};
  var and_arr = [];
  and_arr.push({ seats: { $gte: condition.seats } });
  and_arr.push({ computer: { $gte: condition.computer } });
  if (condition.projector) {
    and_arr.push({ projector: condition.projector });
  }
  if (condition.air_conditional) {
    and_arr.push({ air_conditional: condition.air_conditional });
  }
  if (condition.white_board) {
    and_arr.push({ white_board: condition.white_board });
  }
  if (condition.sound) {
    and_arr.push({ sound: condition.sound });
  }
  query = { $and: and_arr };
  Room.find(query).exec((err, rooms) => {
    var roomIds = _.pluck(rooms, '_id');
    console.log(condition.start);
    console.log(condition.end);
    Booking.find({
      room: { $in: roomIds },
      status: 1,
      $or: [
        {
          $and: [
            { start: { $lt: condition.start } },
            { end: { $gt: condition.start } }
          ]
        },
        {
          $and: [
            { start: { $gte: condition.start } },
            { end: { $gt: condition.start } },
            { end: { $lte: condition.end } }
          ]
        },
        {
          $and: [
            { start: { $gte: condition.start } },
            { start: { $lt: condition.end } },
            { end: { $gt: condition.end } }
          ]
        }
      ]
    })
      .exec((err, bookings) => {
        console.log(bookings);
        if (bookings.length === 0)
          return res.jsonp(rooms);
        var valid_rooms = _.pluck(bookings, 'room');
        // var valid_roomIds = _.pluck(valid_rooms, '_id');
        var rs_rooms = _.filter(rooms, function (room) { return !_.contains(valid_rooms, room._id.toString()); });
        return res.jsonp(rs_rooms);
      });
  });
};
exports.bookingByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: '予約の情報が見つかりません！' });
  }

  Booking.findById(id)
    .populate('user', 'displayName')
    .exec(function (err, booking) {
      if (err) return next(err);
      if (!booking)
        return res.status(404).send({ message: '予約の情報が見つかりません！' });
      req.booking = booking;
      return next();
    });
};
