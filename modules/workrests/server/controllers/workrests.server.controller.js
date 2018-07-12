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

exports.create = function (req, res) {
  var workrest = new Workrest(req.body);
  workrest.user = req.user;

  isConflictRest(workrest).then(result => {
    if (!result) {
      workrest.warning = 'この日には二つの休暇以上入っている。';
    } else {
      workrest.warning = '';
    }

    workrest.historys = [{ action: 1, comment: '', timing: new Date(), user: req.user._id }];
    // if (_.contains(req.user.roles, 'admin') || _.contains(req.user.roles, 'manager') || _.contains(req.user.roles, 'accountant')) {
    //   workrest.status = 3;
    //   workrest.historys.push({ action: 4, comment: '', timing: new Date(), user: workrest.user });
    // }
    // Create search support field
    workrest.search = workrest.user.displayName + '-' + workrest.duration + '-' + workrest.description;
    if (req.user.department) {
      workrest.department = req.user.department;
    }
    workrest.roles = workrest.user.roles;
    workrest.save((err, workrest) => {
      if (err)
        return res.status(400).send({ message: '休暇を保存できません！' });
      res.jsonp(workrest);
    });
  });
};
exports.read = function (req, res) {
  Workrest.findById(req.workrest._id)
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
      return res.jsonp(workrest);
    });
};
exports.update = function (req, res) {
  var workrest = req.workrest;
  workrest = _.extend(workrest, req.body);

  isConflictRest(workrest).then(result => {
    if (!result) {
      workrest.warning = 'この日には二つの休暇以上入っている。';
    } else {
      workrest.warning = '';
    }
    workrest.historys.push({ action: 2, timing: new Date(), user: req.user._id });

    // Create search support field
    workrest.search = workrest.user.displayName + '-' + workrest.duration + '-' + workrest.description;
    if (workrest.user.department) {
      workrest.department = workrest.user.department._id || workrest.user.department;
    }

    workrest.save((err, workrest) => {
      if (err)
        return res.status(400).send({ message: '休暇を保存できません！' });
      return res.jsonp(workrest);
    });
  });
};
exports.request = function (req, res) {
  var workrest = req.workrest;
  // Kiểm tra status của Ngày nghỉ
  if (workrest.status !== 1 && workrest.status !== 4) {
    return res.status(400).send({ message: '休暇の状態で申請できません！' });
  }
  if (req.user._id.toString() !== workrest.user._id.toString()) {
    return res.status(400).send({ message: '休暇の申請は本人が必要になります！' });
  }
  // Kiểm tra lượng ngày nghỉ còn lại
  if (workrest.holiday.isPaid && workrest.duration > workrest.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }

  workrest.status = 2;
  workrest.historys.push({ action: 3, comment: '', timing: new Date(), user: req.user._id });
  workrest.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '休暇を保存できません！' });
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
exports.cancel = function (req, res) {
  var workrest = req.workrest;
  if (req.user._id.toString() !== workrest.user._id.toString()) {
    return res.status(400).send({ message: '休暇の申請は本人が必要になります！' });
  }
  if (workrest.status !== 2) {
    return res.status(400).send({ message: '休暇の状態でキャンセルできません！' });
  }

  workrest.status = 1;
  workrest.historys.push({ action: 6, timing: new Date(), user: req.user._id });
  workrest.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: '休暇を保存できません！' });
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
exports.requestDelete = function (req, res) {
  var workrest = req.workrest;
  if (req.user._id.toString() !== workrest.user._id.toString()) {
    return res.status(400).send({ message: '休暇の取り消し申請は本人が必要になります！' });
  }
  if (workrest.status !== 3) {
    return res.status(400).send({ message: '休暇の状態で取り消し申請できません！' });
  }

  workrest.status = 5;
  workrest.historys.push({ action: 7, timing: new Date(), user: workrest.user });
  workrest.save((err, workrest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
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
exports.delete = function (req, res) {
  var workrest = req.workrest;
  workrest.remove(function (err) {
    if (err)
      return res.status(400).send({ message: '休暇を削除できません！' });
    // Đối với những Ngày nghỉ đã được approve thì trả lại số ngày nghỉ
    if (workrest.status === 5 || workrest.status === 3) {
      // 有給休暇の残日を計算する
      var newHolidayCnt = workrest.user.company.paidHolidayCnt + workrest.duration;
      User.updateHolidays(workrest.user._id, newHolidayCnt);
      // Xóa bỏ workrest khỏi workdate liên quan
      workdateController.removeWorkrestToWorkdates(workrest);
    }
    res.jsonp(workrest);
  });
};






























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

exports.workrestByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: '休暇が見つかりません！' });
  }

  Workrest.findById(id)
    .populate('user', 'displayName profileImageURL')
    .populate('holiday', 'name isPaid')
    .exec(function (err, workrest) {
      if (err) {
        return next(err);
      } else if (!workrest) {
        return res.status(404).send({ message: '休暇が見つかりません！' });
      }
      req.workrest = workrest;
      return next();
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

exports.getWorkrestsToday = function (req, res) {
  var currentDate = _moment().format();
  Workrest.find({
    start: { $lte: currentDate },
    end: { $gte: currentDate },
    status: 3,
  })
    .populate('holiday', 'name')
    .populate('user', 'displayName profileImageURL')
    .exec((err, workrests) => {
      if (err)
        return res.end();
      return res.jsonp(workrests);
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
      for (var index = 0; index < workrests.length; index++) {
        const element = workrests[index];
        if (_moment(workrest.start).isBetween(element.start, element.end, null, '[]') || _moment(workrest.end).isBetween(element.start, element.end, null, '[]') || _moment(element.start).isBetween(workrest.start, workrest.end, null, '[]') || _moment(element.end).isBetween(workrest.start, workrest.end, null, '[]')) {
          return resolve(false);
        }
      }
      return resolve(true);
    });
  });
}
