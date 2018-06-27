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
  name: { type: String },
  created: { type: Date, default: Date.now },
  //  Người đã tạo ra room
  user: { type: Schema.ObjectId, ref: 'User' }
});
RoomSchema.plugin(paginate);

mongoose.model('Room', RoomSchema);
