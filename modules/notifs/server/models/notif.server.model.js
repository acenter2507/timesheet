'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Notif Schema
 */
var NotifSchema = new Schema({
  from: { type: Schema.ObjectId, ref: 'User' },
  to: { type: Schema.ObjectId, ref: 'User' },
  // 1: Request Rest
  // 2: Reject rest
  // 3: Approve rest
  type: { type: Number, default: 0 },
  message: { type: String, required: true },
  state: { type: String, default: '' },
  status: { type: Number, default: 0 },
  // Số lần request
  count: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
});

mongoose.model('Notif', NotifSchema);
