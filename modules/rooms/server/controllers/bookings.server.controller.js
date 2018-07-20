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

  booking.save(function (err) {
    if (err)
      return res.status(400).send({ message: '予約を保存できません！' });
    return res.jsonp(booking);
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
