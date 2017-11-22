'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Rest = mongoose.model('Rest'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

/**
 * Create a Rest
 */
exports.create = function (req, res) {
  var rest = new Rest(req.body);
  rest.user = req.user._id || req.user;

  // 有給休暇の日数を確認
  if (req.body.isPaid && rest.duration > req.user.company.paidHolidayCnt) {
    return res.status(400).send({ message: '有給休暇の残日が不足です。' });
  }
  rest.history = [{ action: 1, comment: '', timing: rest.created }];
  if (req.body.isSendWhenSave) {
    rest.status = 2;
    rest.history.push({ action: 3, comment: '', timing: new Date(), user: rest.user });
  }
  if (_.contains(req.user.roles, 'admin') || _.contains(req.user.roles, 'manager') || _.contains(req.user.roles, 'accountant')) {
    rest.status = 3;
    rest.history.push({ action: 4, comment: '', timing: new Date(), user: rest.user });
  }
  // Create search support field
  rest.search = rest.user.displayName + rest.duration + rest.description;
  rest.department = req.user.department._id || req.user.department;
  rest.roles = req.user.roles;
  console.log(rest);
  rest.save((err, rest) => {
    if (err)
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    res.jsonp(rest);
    if (rest.status === 2) {
      // 有給休暇の残日を計算する
      var newHolidayCnt = req.user.company.paidHolidayCnt - rest.duration;
      User.updateHolidays(req.user._id, newHolidayCnt);
      /* TODO */
    }
  });
};

/**
 * Show the current Rest
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var rest = req.rest ? req.rest.toJSON() : {};
  rest.isCurrentUserOwner = req.user && rest.user && rest.user._id.toString() === req.user._id.toString();
  res.jsonp(rest);
};

/**
 * Update a Rest
 */
exports.update = function (req, res) {
  var rest = req.rest;

  rest = _.extend(rest, req.body);
  // Create search support field
  rest.search = rest.user.displayName + rest.duration + rest.description;

  rest.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rest);
    }
  });
};

/**
 * Delete an Rest
 */
exports.delete = function (req, res) {
  var rest = req.rest;

  rest.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(rest);
    }
  });
};

/**
 * List of Rests
 */
exports.list = function (req, res) {
  Rest.find({ user: req.user._id })
    .sort('-created')
    .populate('holiday', 'name isPaid')
    .exec(function (err, rests) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(rests);
      }
    });
};

/**
 * Rest middleware
 */
exports.restByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Rest is invalid'
    });
  }

  Rest.findById(id)
    .populate('user', 'displayName roles leaders profileImageURL email')
    .populate('holiday', 'name isPaid').exec(function (err, rest) {
      if (err) {
        return next(err);
      } else if (!rest) {
        return res.status(404).send({
          message: 'No Rest with that identifier has been found'
        });
      }
      req.rest = rest;
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
  Rest.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'holiday', select: 'name isPaid' }
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
    var department = req.user.department._id || req.user.department;
    and_arr.push({ department: department });
    and_arr.push({ roles: { $ne: ['manager', 'admin', 'accountant'] } });
  } else {
    if (condition.department) {
      and_arr.push({ department: condition.department });
    }
    if (condition.roles) {
      and_arr.push({ roles: condition.roles });
    }
  }
  if (and_arr.length > 0) {
    query = { $and: and_arr };
  }
  Rest.paginate(query, {
    sort: condition.sort,
    page: page,
    populate: [
      { path: 'holiday', select: 'name isPaid' }
    ],
    limit: condition.limit
  }).then(function (rests) {
    res.jsonp(rests);
  }, err => {
    console.log(err);
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};