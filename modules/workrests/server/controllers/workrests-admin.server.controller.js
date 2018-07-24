'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Workrest = mongoose.model('Workrest'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  workdateController = require(path.resolve('./modules/workdates/server/controllers/workdates.server.controller')),
  _ = require('underscore'),
  _moment = require('moment');

exports.reviews = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var query = {};
  var and_arr = [];
  if (condition.search && condition.search !== '') {
    var key_lower = condition.search.toLowerCase();
    var key_upper = condition.search.toUpperCase();
    var or_arr = [
      { description: { $regex: '.*' + condition.search + '.*' } },
      { description: { $regex: '.*' + key_lower + '.*' } },
      { description: { $regex: '.*' + key_upper + '.*' } },
      { search: { $regex: '.*' + condition.search + '.*' } },
      { search: { $regex: '.*' + key_lower + '.*' } },
      { search: { $regex: '.*' + key_upper + '.*' } }
    ];
    and_arr.push({ $or: or_arr });
  }
  if (condition.start) {
    and_arr.push({ start: { $gte: condition.start } });
  }
  if (condition.end) {
    and_arr.push({ end: { $lte: condition.end } });
  }
  if (condition.status) {
    and_arr.push({ status: condition.status });
  }
  if (_.contains(req.user.roles, 'manager')) {
    if (!req.user.department) {
      return res.jsonp({ docs: [], pages: 0, total: 0 });
    }
    var department = req.user.department._id || req.user.department;
    and_arr.push({ department: department });
    and_arr.push({ roles: { $ne: ['manager', 'admin', 'accountant'] } });
  } else {
    if (condition.department) {
      if (condition.department === 'empty') {
        and_arr.push({ department: null });
      } else {
        and_arr.push({ department: condition.department });
      }
    }
    if (condition.roles && condition.roles.length > 0) {
      and_arr.push({ roles: condition.roles });
    }
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  Workrest.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'holiday', select: 'name isPaid' },
      { path: 'user', select: 'displayName profileImageURL' },
      {
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      },
    ],
    limit: condition.limit
  }).then(function (rests) {
    res.jsonp(rests);
  }, err => {
    return res.status(400).send({ message: '休暇情報を取得できません' });
  });
};
exports.approve = function (req, res) {
  var workrest = req.workrest;

  // Kiểm tra số ngày nghỉ còn lại
  if (workrest.isPaid && workrest.duration > workrest.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }

  workrest.historys.push({ action: 4, comment: '', timing: new Date(), user: req.user._id });
  workrest.status = 3;
  workrest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: '承認処理が完了できません。' });
    Workrest.findById(workrest._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL roles leaders profileImageURL email company')
      .populate('department', 'name')
      .populate('holiday', 'name isPaid')
      .exec(function (err, workrest) {
        if (err)
          return res.status(400).send({ message: '休暇の情報が見つかりません！' });
        workrest = workrest.toJSON();
        workrest.isCurrentUserOwner = workrest.user._id.toString() === req.user._id.toString();
        // 有給休暇の残日を計算する
        var newHolidayCnt = workrest.user.company.paidHolidayCnt - workrest.duration;
        User.updateHolidays(workrest.user._id, newHolidayCnt);
        // Thêm workrest vào các workdate có liên quan
        workdateController.addWorkrestToWorkdates(workrest);
        // TODO
        // Load lại toàn bộ thông tin workmonth và workdate
        return res.jsonp(workrest);
      });
  });
};
exports.reject = function (req, res) {
  var workrest = req.workrest;
  workrest.historys.push({ action: 5, comment: req.body.data.comment, timing: new Date(), user: req.user._id });
  workrest.status = 4;
  workrest.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    Workrest.findById(workrest._id)
      .populate({
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      })
      .populate('user', 'displayName profileImageURL roles leaders profileImageURL email company')
      .populate('department', 'name')
      .populate('holiday', 'name isPaid')
      .exec(function (err, workrest) {
        if (err)
          return res.status(400).send({ message: '休暇の情報が見つかりません！' });
        return res.jsonp(workrest);
      });
  });
};