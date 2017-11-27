'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Notification Schema
 */
var NotificationSchema = new Schema({
  from: { type: Schema.ObjectId, ref: 'User' },
  to: { type: Schema.ObjectId, ref: 'User' },
  // 0: like poll, 1: dislike, 2: reply, 3: comment, 4: option request
  type: { type: Number, default: 0 },
  message: { type: String, required: true },
  state: { type: String, default: '' },
  status: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
});

mongoose.model('Notification', NotificationSchema);
