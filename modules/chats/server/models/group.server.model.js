'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Group Schema
 */
var GroupSchema = new Schema({
  // Các member trong user
  users: [{ type: Schema.ObjectId, ref: 'User' }],
  avatar: { type: String },
  name: { type: String },
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  started: { type: Number, default: 1 },
  //  Người đã tạo ra group
  user: { type: Schema.ObjectId, ref: 'User' },
  // Loại group chat (1: Private, 2: Group, 3: My Chat)
  kind: { type: Number, default: 1 },
});
GroupSchema.plugin(paginate);

mongoose.model('Group', GroupSchema);
