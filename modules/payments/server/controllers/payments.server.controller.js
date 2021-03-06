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
  fs = require('fs'),
  _ = require('underscore');

exports.create = function (req, res) {
  var payment = new Payment(req.body);
  payment.user = req.user;

  if (payment.user.department) {
    payment.department = payment.user.department._id || payment.user.department;
  }
  payment.roles = payment.user.roles;
  payment.historys.push({ action: 1, timing: new Date(), user: req.user._id });
  payment.save(function (err) {
    if (err)
      return res.status(400).send({ message: '清算表を保存できません！' });
    return res.jsonp(payment);
  });
};
exports.read = function (req, res) {
  Payment.findById(req.payment._id)
    .populate({
      path: 'historys', populate: [
        { path: 'user', select: 'displayName profileImageURL', model: 'User' },
      ]
    })
    .populate('user', 'displayName profileImageURL')
    .populate('department', 'name')
    .exec(function (err, payment) {
      if (err)
        return res.status(400).send({ message: '清算表の情報が見つかりません！' });
      return res.jsonp(payment);
    });
};
exports.update = function (req, res) {
  var payment = req.payment;

  payment = _.extend(payment, req.body);
  payment.historys.push({ action: 2, timing: new Date(), user: req.user._id });
  if (payment.user.department) {
    payment.department = payment.user.department._id || payment.user.department;
  }
  payment.roles = payment.user.roles;
  payment.save(function (err) {
    if (err)
      return res.status(400).send({ message: '清算表を保存できません！' });
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
  });
};
exports.delete = function (req, res) {
  var payment = req.payment;

  payment.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '清算表を削除できません！' });
    return res.jsonp(payment);
  });
};
exports.list = function (req, res) {
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
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
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
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
  });
};
exports.requestDelete = function (req, res) {
  var payment = req.payment;
  // Kiểm tra người gửi cancel chính chủ
  if (req.user._id.toString() !== payment.user._id.toString()) {
    return res.status(400).send({ message: '清算表の取り消し申請は本人が必要になります！' });
  }
  // Kiểm tra trạng thái của timesheet
  if (payment.status !== 3) {
    return res.status(400).send({ message: '清算表の状態で取り消し申請できません！' });
  }
  payment.status = 5;
  payment.historys.push({ action: 7, timing: new Date(), user: req.user._id });
  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '清算表の状態を変更できません！' });
    Payment.findById(payment._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL')
      .populate('department', 'name')
      .exec(function (err, payment) {
        if (err)
          return res.status(400).send({ message: '清算表の情報が見つかりません！' });
        return res.jsonp(payment);
      });
  });
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
exports.deleteReceipt = function (req, res) {
  var payment = req.payment;
  var receipt = req.body.receipt;

  for (let i = 0; i < payment.transports.length; i++) {
    const element = payment.transports[i];
    if (_.contains(element.receipts, receipt))
      element.receipts = _.without(element.receipts, receipt);
  }
  for (let i = 0; i < payment.trips.length; i++) {
    const element = payment.transports[i];
    if (_.contains(element.receipts, receipt))
      element.receipts = _.without(element.receipts, receipt);
  }
  for (let i = 0; i < payment.others.length; i++) {
    const element = payment.others[i];
    if (_.contains(element.receipts, receipt))
      element.receipts = _.without(element.receipts, receipt);
  }
  for (let i = 0; i < payment.vehicles.length; i++) {
    const element = payment.vehicles[i];
    if (_.contains(element.receipts, receipt))
      element.receipts = _.without(element.receipts, receipt);
  }
  for (let i = 0; i < payment.meetings.length; i++) {
    const element = payment.meetings[i];
    if (_.contains(element.receipts, receipt))
      element.receipts = _.without(element.receipts, receipt);
  }

  payment.save((err, payment) => {
    if (err)
      return res.status(400).send({ message: '領収書を削除できません！' });
    if (fs.existsSync(receipt)) {
      fs.unlink(receipt);
    }
    return res.end();
  });
};
exports.paymentByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'リクエストのデータが存在しません！'
    });
  }
  Payment.findById(id)
    .populate('user', 'displayName profileImageURL roles')
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
