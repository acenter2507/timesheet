'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Workdate Schema
 */
var WorkdateSchema = new Schema({
  monthDb: { type: Schema.ObjectId, ref: 'Month' },
  month: { type: Number }, // カレンダーの月
  date: { type: Number }, // カレンダーの日
  day: { type: Number }, // 曜日
  content: { type: String, trim: true }, // 業務内容
  start: { type: String, default: '' }, // 開始
  end: { type: String, default: '' }, // 終了
  middleRest: { type: Number }, // 休憩 (hour)
  overtime: { type: Number, default: 0 }, // 時間外
  late: { type: Number, default: 0 }, // 深夜
  rests: [{ type: Schema.ObjectId, ref: 'Rest' }], // 休日形態
  transfer: { type: Boolean, default: false }, // 振替
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
WorkdateSchema.plugin(paginate);

mongoose.model('Workdate', WorkdateSchema);
