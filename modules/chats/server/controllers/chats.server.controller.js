'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Chat = mongoose.model('Chat'),
  Group = mongoose.model('Group'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('underscore');

exports.create = function (req, res) {
  var chat = new Chat(req.body);
  chat.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのメッセージを送信できません！' });
    // Trả về giá trị đầy đủ sau khi lưu
    Chat.populate(chat, { path: 'user', select: 'displayName profileImageURL' }, (err, char) => {
      return res.jsonp(chat);
    });
  });
};

exports.read = function (req, res) {
  Chat.findById(req.chat._id)
    .populate('user', 'displayName profileImageURL')
    .exec((err, chat) => {
      if (err)
        return res.status(400).send({ message: 'チャットのメッセージが見つかりません！' });
      return res.jsonp(chat);
    });
};

exports.update = function (req, res) {
  var chat = req.chat;
  chat = _.extend(chat, req.body);

  chat.save(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのメッセージを保存できません！' });
    return res.jsonp(chat);
  });
};

exports.delete = function (req, res) {
  var chat = req.chat;

  chat.remove(function (err) {
    if (err)
      return res.status(400).send({ message: 'チャットのメッセージを削除できません！' });
    return res.jsonp(chat);
  });
};

exports.load = function (req, res) {
  var group = req.body.group;
  var paginate = req.body.paginate;
  Chat.paginate({ group: group }, {
    page: paginate.page,
    limit: paginate.limit,
    sort: '-created',
    populate: [{ path: 'user', select: 'displayName profileImageURL' }],
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'メッセージの情報を取得できません！' });
  });
};

exports.users = function (req, res) {
  var paginate = req.body.paginate;
  User.paginate({ roles: { $ne: 'admin' }, status: 1 }, {
    page: paginate.page,
    limit: paginate.limit,
    select: ('displayName profileImageURL'),
  }).then(result => {
    return res.jsonp(result.docs);
  }).catch(err => {
    return res.status(400).send({ message: 'ユーザー情報を取得できません！' });
  });
};

exports.chatByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).send({ message: 'メッセージが見つかりません！' });

  Chat.findById(id).populate('user', 'displayName').exec(function (err, chat) {
    if (err)
      return next(err);
    if (!chat)
      return res.status(404).send({ message: 'メッセージが見つかりません！' });

    req.chat = chat;
    return next();
  });
};