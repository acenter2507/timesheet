'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

var RoomSchema = new Schema({
  name: { type: String, required: '会議室の名前は必須です。', trim: true },
  info: { type: String, default: '' },
  seats: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
RoomSchema.plugin(paginate);

mongoose.model('Room', RoomSchema);
