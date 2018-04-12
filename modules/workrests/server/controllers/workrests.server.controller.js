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

/**
 * Tạo mới ngày nghỉ
 */
exports.create = function (req, res) {
  var workrest = new Workrest(req.body);
  workrest.user = req.user;

  isConflictRest(workrest).then(result => {
    if (!result) {
      workrest.warning = 'この日には二つの休暇以上入っている。';
    } else {
      workrest.warning = '';
    }

    workrest.historys = [{ action: 1, comment: '', timing: workrest.created, user: workrest.user }];
    // if (_.contains(req.user.roles, 'admin') || _.contains(req.user.roles, 'manager') || _.contains(req.user.roles, 'accountant')) {
    //   workrest.status = 3;
    //   workrest.historys.push({ action: 4, comment: '', timing: new Date(), user: workrest.user });
    // }
    // Create search support field
    workrest.search = workrest.user.displayName + '-' + workrest.duration + '-' + workrest.description;
    if (workrest.user.department) {
      workrest.department = workrest.user.department._id || workrest.user.department;
    }
    workrest.roles = workrest.user.roles;
    workrest.save((err, workrest) => {
      if (err)
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      res.jsonp(workrest);
    });
  });
};

/**
 * Gửi thỉnh cầu review
 */
exports.request = function (req, res) {
  var workrest = req.workrest;
  // Kiểm tra status của Ngày nghỉ
  if (workrest.status !== 1 && workrest.status !== 4) {
    return res.status(400).send({ message: 'この休暇は申請できません！' });
  }

  // Kiểm tra lượng ngày nghỉ còn lại
  if (workrest.isPaid && workrest.duration > workrest.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }

  workrest.status = 2;
  workrest.historys.push({ action: 3, comment: '', timing: new Date(), user: workrest.user });
  workrest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(workrest);
  });
};

/**
 * Hủy bỏ thỉnh cầu
 */
exports.cancel = function (req, res) {
  var workrest = req.workrest;
  // Kiểm tra status của Ngày nghỉ
  if (workrest.status !== 2) {
    return res.status(400).send({ message: '現在確認中の状態ではありません！' });
  }

  workrest.status = 1;
  workrest.historys.push({ action: 6, comment: '', timing: new Date(), user: workrest.user });
  workrest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(workrest);
  });
};

/**
 * Gửi thỉnh cầu xóa Ngày nghỉ đã được approve
 */
exports.deleteRequest = function (req, res) {
  var workrest = req.workrest;
  // Kiểm tra status của Ngày nghỉ
  if (workrest.status !== 3) {
    return res.status(400).send({ message: '取り消し申請は確認済みの休暇しかできません！' });
  }

  workrest.status = 5;
  workrest.historys.push({ action: 7, comment: '', timing: new Date(), user: workrest.user });
  workrest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(workrest);
  });
};

/**
 * Xem chi tiết thông tin ngày nghỉ
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var workrest = req.workrest ? req.workrest.toJSON() : {};
  workrest.isCurrentUserOwner = req.user && workrest.user && workrest.user._id.toString() === req.user._id.toString();
  res.jsonp(workrest);
};

/**
 * Chỉnh sửa thông tin ngày nghỉ
 */
exports.update = function (req, res) {
  var workrest = req.workrest;
  workrest = _.extend(workrest, req.body);

  isConflictRest(workrest).then(result => {
    if (!result) {
      workrest.warning = 'この日には二つの休暇以上入っている。';
    } else {
      workrest.warning = '';
    }
    // return res.status(400).send({ message: '休暇日程が既に登録されました。自分のスケジュールを確認してください。' });

    workrest.status = 1;
    workrest.historys.push({ action: 2, comment: '', timing: new Date(), user: req.user._id });

    // Create search support field
    workrest.search = workrest.user.displayName + '-' + workrest.duration + '-' + workrest.description;
    if (workrest.user.department) {
      workrest.department = workrest.user.department._id || workrest.user.department;
    }

    workrest.save((err, workrest) => {
      if (err)
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      res.jsonp(workrest);
    });
  });
};

/**
 * Approve a Rest
 */
exports.approve = function (req, res) {
  var workrest = req.workrest;

  // Kiểm tra số ngày nghỉ còn lại
  if (workrest.isPaid && workrest.duration > workrest.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }

  // Kiểm tra workmonth và workdate
  var start = _moment(workrest.start);
  var end = _moment(workrest.end);
  var duration  = end.diff(start, 'days');

  var promises = [];
  for (let index = 0; index <= durration; index++) {
    var date = start.clone().add(index, 'days');
    promises.push(workdateController.verifyWorkdateWithWorkrest(date, workrest));
  }
  Promise.all(promises)
    .then(result => {
      console.log(result);
      res.end();
    })
    .catch(err => {
      console.log(err);
      res.end();
    });

  // workrest.historys.push({ action: 4, comment: '', timing: new Date(), user: req.user._id });
  // workrest.status = 3;
  // workrest.save((err, rest) => {
  //   if (err)
  //     return res.status(400).send({ message: '承認処理が完了できません。' });
  //   Workrest.findOne(workrest)
  //     .populate({
  //       path: 'historys',
  //       populate: {
  //         path: 'user',
  //         select: 'displayName profileImageURL',
  //         model: 'User'
  //       }
  //     })
  //     .populate('holiday', 'name isPaid')
  //     .populate('user')
  //     .exec((err, workrest) => {
  //       if (err)
  //         return res.status(400).send({ message: '新しいデータを取得できません。' });
  //       res.jsonp(workrest);
  //       // 有給休暇の残日を計算する
  //       var newHolidayCnt = workrest.user.company.paidHolidayCnt - workrest.duration;
  //       User.updateHolidays(workrest.user._id, newHolidayCnt);
  //       // TODO
  //       // Load lại toàn bộ thông tin workmonth và workdate
  //     });
  // });
};

/**
 * Approve a Rest
 */
exports.reject = function (req, res) {
  var workrest = req.workrest;
  workrest.historys.push({ action: 5, comment: req.body.data.comment, timing: new Date(), user: req.user._id });
  workrest.status = 4;
  workrest.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '拒否処理が完了できません。' });
    Workrest.findOne(workrest)
      .populate({
        path: 'historys',
        populate: {
          path: 'user',
          select: 'displayName profileImageURL',
          model: 'User'
        }
      })
      .populate('holiday', 'name isPaid')
      .populate('user')
      .exec((err, rest) => {
        if (err)
          return res.status(400).send({ message: '新しいデータを取得できません。' });
        return res.jsonp(rest);
      });
  });
};

/**
 * Delete an Workrest
 */
exports.delete = function (req, res) {
  var workrest = req.workrest;
  // Đối với những Ngày nghỉ đã được approve thì trả lại số ngày nghỉ
  if (workrest.status === 5) {
    // 有給休暇の残日を計算する
    var newHolidayCnt = workrest.user.company.paidHolidayCnt + workrest.duration;
    User.updateHolidays(workrest.user._id, newHolidayCnt);
  }
  workrest.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(workrest);
    }
  });
};

/**
 * List of Workrests
 */
exports.list = function (req, res) {
  Workrest.find({ user: req.user._id })
    .sort('-created')
    .populate('holiday', 'name isPaid')
    .exec(function (err, workrests) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(workrests);
      }
    });
};

/**
 * Workrest middleware
 */
exports.workrestByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Workrest is invalid'
    });
  }

  Workrest.findById(id)
    .populate('user', 'displayName roles leaders profileImageURL email company')
    .populate('holiday', 'name isPaid').exec(function (err, workrest) {
      if (err) {
        return next(err);
      } else if (!workrest) {
        return res.status(404).send({
          message: 'No Workrest with that identifier has been found'
        });
      }
      req.workrest = workrest;
      next();
    });
};

exports.getRestOfCurrentUser = function (req, res) {
  var page = req.body.page || 1;
  var condition = req.body.condition || {};
  var query = {};
  var and_arr = [];
  and_arr.push({ user: req.user._id });
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
  query = { $and: and_arr };
  Workrest.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'holiday', select: 'name isPaid' },
      {
        path: 'historys', populate: [
          { path: 'user', select: 'displayName profileImageURL', model: 'User' },
        ]
      },
    ],
    limit: 10
  }).then(function (rests) {
    res.jsonp(rests);
  }, err => {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

exports.getRestOfCurrentUserInRange = function (req, res) {
  var userId = req.body.userId;
  var start = req.body.start;
  var end = req.body.end;

  if (!userId || !start || !end)
    return res.status(400).send({ message: 'リクエストのデータが不足です。' });

  Workrest.find({
    $and: [
      { user: userId },
      {
        $or: [
          { $and: [{ start: { $lte: start } }, { end: { $gte: start } }, { end: { $lte: end } }] },
          { $and: [{ start: { $gte: start } }, { end: { $lte: end } }] },
          { $and: [{ start: { $lte: start } }, { end: { $gte: end } }] },
          { $and: [{ start: { $gte: start } }, { start: { $lte: end } }, { end: { $gte: end } }] }
        ]
      },
      { status: 3 },
    ]
  })
    .populate('holiday')
    .exec((err, rests) => {
      if (err)
        return res.status(400).send({ message: 'データを取得できません。' });
      return res.jsonp(rests);
    });
};

exports.getRestReview = function (req, res) {
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
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

function isConflictRest(workrest) {
  return new Promise((resolve, reject) => {
    var condition = {
      _id: { $ne: workrest._id },
      user: workrest.user
      //start: { $gte: new Date() }
    };

    Workrest.find(condition).exec((err, workrests) => {
      if (workrests.length === 0) return resolve(true);
      for (let index = 0; index < workrests.length; index++) {
        const element = workrests[index];
        if (_moment(workrest.start).isBetween(element.start, element.end, null, '[]') || _moment(workrest.end).isBetween(element.start, element.end, null, '[]') || _moment(element.start).isBetween(workrest.start, workrest.end, null, '[]') || _moment(element.end).isBetween(workrest.start, workrest.end, null, '[]')) {
          return resolve(false);
        }
      }
      return resolve(true);
    });
  });
}