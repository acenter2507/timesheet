'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
  from: { type: String, required: true },
  to: { type: Schema.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  links: [{ type: String }],
  // 1: Normal - 2: Hight - 3: Urgent
  flag: { type: Number, default: 1 },
  status: { type: Number, default: 0 },
  created: { type: Date, default: Date.now }
});

mongoose.model('Message', MessageSchema);
