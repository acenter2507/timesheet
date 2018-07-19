'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Group = mongoose.model('Group'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.create = function (req, res) {
  var group = new Group(req.body);
  group.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを保存できません！' });
    Group.findById(group._id)
      .populate('users', 'displayName profileImageURL')
      .populate('user', 'displayName profileImageURL')
      .exec((err, group) => {
        if (err)
          return res.status(400).send({ message: 'チャットのルームが見つかりません！' });
        return res.jsonp(group);
      });
  });
};

exports.read = function (req, res) {
  Group.findById(req.group._id)
    .populate('users', 'displayName profileImageURL')
    .populate('user', 'displayName profileImageURL')
    .exec((err, group) => {
      if (err)
        return res.status(400).send({ message: 'チャットのルームが見つかりません！' });
      return res.jsonp(group);
    });
};

exports.update = function (req, res) {
  var group = req.group;
  group = _.extend(group, req.body);
  group.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを保存できません！' });
    return res.jsonp(group);
  });
};

exports.delete = function (req, res) {
  var group = req.group;

  group.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのルームを削除できません！' });
    return res.jsonp(group);
  });
};

exports.load = function (req, res) {
  var condition = req.body.condition;
  Group.paginate({ users: condition.user, started: 2 }, {
    page: condition.paginate.page,
    limit: condition.paginate.limit,
    sort: '-updated',
    populate: [
      { path: 'users', select: 'displayName profileImageURL' },
      { path: 'user', select: 'displayName profileImageURL' }
    ],
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'チャットグループを取得できません！' });
  });
};

exports.privateGroup = function (req, res) {
  var users = [req.body.user, req.user._id];

  Group.findOne(
    {
      $and: [
        { users: req.body.user },
        { users: req.user._id },
        { users: { $size: 2 } },
        { kind: 1 }
      ]
    })
    .exec((err, group) => {
      if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
      if (group) return res.jsonp(group);

      var _group = new Group({
        users: users,
        kind: 1,
        user: req.user._id
      });
      _group.save(function (err) {
        if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
        return res.jsonp(_group);
      });

    });
};

exports.myGroup = function (req, res) {
  Group.findOne(
    {
      $and: [
        { user: req.user._id },
        { users: [req.user._id] },
        { users: { $size: 1 } },
        { kind: 3 }
      ]
    })
    .exec((err, group) => {
      if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
      if (group) return res.jsonp(group);

      var _group = new Group({
        users: [req.user._id],
        kind: 3,
        user: req.user._id
      });
      _group.save(function (err) {
        if (err) return res.status(400).send({ message: 'エラーが発生しました！' });
        return res.jsonp(_group);
      });
    });
};

exports.groupByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send({ message: 'リクエストの情報が見つかりません！' });

  Group.findById(id)
    .exec(function (err, group) {
      if (err) return next(err);
      if (!group)
        return res.status(404).send({ message: 'チャットルームが見つかりません！' });
      req.group = group;
      return next();
    });
};
