'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Room = mongoose.model('Room'),
  Booking = mongoose.model('Booking'),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  fs = require('fs'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.reject = function (req, res) {
  var booking = req.booking;
  // Kiểm tra người gửi request chính chủ
  if (!_.contains(req.user.roles, 'accountant')) {
    return res.status(400).send({ message: '経理部以外はできません！' });
  }

  booking.status = 4;
  booking.save((err, booking) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    return res.jsonp(booking);
  });
};