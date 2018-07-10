'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Payment = mongoose.model('Payment'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  _ = require('underscore');

exports.create = function (req, res) {
  var payment = new Payment(req.body);
  payment.user = req.user;

  payment.save(function (err) {
    if (err)
      return res.status(400).send({ message: '清算表を保存できません！' });
    return res.jsonp(payment);
  });
};
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var payment = req.payment ? req.payment.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  payment.isCurrentUserOwner = req.user && payment.user && payment.user._id.toString() === req.user._id.toString();

  res.jsonp(payment);
};
exports.update = function (req, res) {
  var payment = req.payment;

  payment = _.extend(payment, req.body);

  payment.save(function (err) {
    if (err)
      return res.status(400).send({ message: '清算表を保存できません！' });
    return res.jsonp(payment);
  });
};
exports.delete = function (req, res) {
  var payment = req.payment;

  payment.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: '清算表を削除できません！'
      });
    } else {
      res.jsonp(payment);
    }
  });
};
exports.list = function (req, res) {
  Payment.find().sort('-created').populate('user', 'displayName').exec(function (err, payments) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(payments);
    }
  });
};
exports.paymentsByYear = function (req, res) {
  var year = req.body.year;
  if (!year || year === '') return res.status(400).send({ message: 'リクエスト情報が間違います。' });

  Payment.find({ user: req.user._id, year: year })
    .populate({
      path: 'historys',
      populate: {
        path: 'user',
        select: 'displayName profileImageURL',
        model: 'User'
      }
    })
    .exec(function (err, payments) {
      if (err)
        return res.status(400).send({ message: 'データを取得できません。' });
      return res.jsonp(payments);
    });
};
exports.request = function (req, res) {
  var payment = req.payment;
  // Kiểm tra người gửi request chính chủ
  if (req.user._id.toString() !== payment.user._id.toString()) {
    return res.status(400).send({ message: '清算表の申請は本人が必要になります！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (payment.status !== 1 && payment.status !== 4) {
    return res.status(400).send({ message: '清算表の状態で申請できません！' });
  }
  payment.status = 2;
  payment.historys.push({ action: 3, timing: new Date(), user: req.user._id });
  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '清算表の状態を変更できません！' });
    return res.jsonp(payment);
  });
};
exports.cancel = function (req, res) {
  var payment = req.payment;
  // Kiểm tra người gửi cancel chính chủ
  if (req.user._id.toString() !== payment.user._id.toString()) {
    return res.status(400).send({ message: '清算表のキャンセルは本人が必要になります！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (payment.status !== 2) {
    return res.status(400).send({ message: '清算表の状態でキャンセルできません！' });
  }
  payment.status = 1;
  payment.historys.push({ action: 6, timing: new Date(), user: req.user._id });
  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '清算表の状態を変更できません！' });
    return res.jsonp(payment);
  });
};
exports.approve = function (req, res) {
  res.end();
};
exports.reject = function (req, res) {
  res.end();
};
exports.receipts = function (req, res) {
  var upload = multer(config.uploads.paymentReceipts).single('paymentReceipts');
  var filter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
  upload.fileFilter = filter;
  upload(req, res, function (uploadError) {
    if (uploadError) return res.status(400).send({ message: '画像をアップロードできません。' });
    var imageUrl = config.uploads.paymentReceipts.dest + req.file.filename;
    return res.jsonp(imageUrl);
  });
};
exports.paymentByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'リクエストのデータが存在しません！'
    });
  }
  Payment.findById(id)
    .populate('user', 'displayName profileImageURL')
    .exec(function (err, payment) {
      if (err) {
        return next(err);
      } else if (!payment) {
        return res.status(404).send({
          message: '清算表の情報が見つかりません！'
        });
      }
      req.payment = payment;
      next();
    });
};
