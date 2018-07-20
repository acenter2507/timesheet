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

exports.images = function (req, res) {
  var upload = multer(config.uploads.roomImages).single('roomImages');
  var filter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  upload.fileFilter = filter;
  upload(req, res, function (uploadError) {
    if (uploadError) return res.status(400).send({ message: '画像をアップロードできません。' });
    var imageUrl = config.uploads.roomImages.dest + req.file.filename;
    return res.jsonp(imageUrl);
  });
};
exports.deleteImage = function (req, res) {
  var room = req.room;
  var image = req.body.image;
  room.images = _.without(room.images, image);

  room.save((err, room) => {
    if (err)
      return res.status(400).send({ message: '写真を削除できません！' });
    if (fs.existsSync(image)) {
      fs.unlink(image);
    }
    return res.end();
  });
};
exports.bookings = function (req, res) {
  var room = req.room;
  Booking.find({ room: room._id, status: 1 })
    .populate('user', 'displayName profileImageURL')
    .exec((err, bookings) => {
      if (err)
        return res.status(400).send({ message: '予約情報を取得できません！' });
      return res.jsonp(bookings);
    });
};