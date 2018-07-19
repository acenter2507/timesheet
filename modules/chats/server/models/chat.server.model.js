'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Chat Schema
 */
var ChatSchema = new Schema({
  // Id group chả
  group: { type: Schema.ObjectId, ref: 'Group' },
  // Nội dung của tin nhắn
  content: { type: String, default: '' },
  // User đã xem tin nhắn này hay chưa 1: chưa xem - 2: xem rồi
  status: { type: Number, default: 1 },
  historys: [{
    date: { type: Date },
    content: { type: String }
  }],
  created: { type: Date, default: Date.now },
  to: { type: Schema.ObjectId, ref: 'User' },
  user: { type: Schema.ObjectId, ref: 'User' }
});
ChatSchema.plugin(paginate);

mongoose.model('Chat', ChatSchema);
