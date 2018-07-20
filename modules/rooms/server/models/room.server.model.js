'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

var RoomSchema = new Schema({
  name: { type: String, required: '会議室の名前は必須です。', trim: true },
  usable: { type: Boolean, default: true },
  description: { type: String, default: '' },
  // 席数
  seats: { type: Number, default: 1 },
  // プロジェクター
  projector: { type: Boolean, default: false },
  // エアコン
  air_conditional: { type: Boolean, default: false },
  // ホワイトボードー
  white_board: { type: Boolean, default: false },
  // パソコン
  computer: { type: Number, default: 0 },
  // 音響
  sound: { type: Boolean, default: false },
  // 写真
  images: [{ type: String }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
RoomSchema.plugin(paginate);

mongoose.model('Room', RoomSchema);
