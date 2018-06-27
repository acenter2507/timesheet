'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Room Schema
 */
var RoomSchema = new Schema({
  // Các member trong user
  users: [{ type: Schema.ObjectId, ref: 'User' }],
  avatar: { type: String, default: './modules/code/client/img/brand/logo.png' },
  name: { type: String },
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  //  Người đã tạo ra room
  user: { type: Schema.ObjectId, ref: 'User' },
  // Loại room chat (1: Private, 2: Group)
  kind: { type: Number, default: 1 },
});
RoomSchema.plugin(paginate);

mongoose.model('Room', RoomSchema);
