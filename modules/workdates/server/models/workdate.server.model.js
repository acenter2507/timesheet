'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  relationship = require("mongoose-relationship"),
  Schema = mongoose.Schema;

/**
 * Workdate Schema
 */
var WorkdateSchema = new Schema({
  workmonth: { type: Schema.ObjectId, ref: 'Workmonth', childPath:"workdates" },
  workrests: [{ type: Schema.ObjectId, ref: 'Workrest', childPath:"workdates" }],
  year: { type: Number },
  month: { type: Number }, // カレンダーの月
  date: { type: Number }, // カレンダーの日
  day: { type: Number }, // 曜日
  isHoliday: { type: Boolean, default: false }, // 休日
  content: { type: String, trim: true }, // 業務内容
  start: { type: String, default: '' }, // 開始
  end: { type: String, default: '' }, // 終了
  middleRest: { type: Number, default: 0 }, // 休憩 (hour)
  overtime: { type: Number, default: 0 }, // 時間外
  overnight: { type: Number, default: 0 }, // 深夜
  work_duration: { type: Number, default: 0 }, // Số tiếng đã làm việc
  transfer: { type: Boolean, default: false }, // Ngày này được sử dụng transfer
  transfers: [ //transfer_workdate
    { type: Schema.ObjectId, ref: 'Workdate' }
  ], // Ngày liên kết khi transfer
  comments: [
    {
      author: { type: String },
      content: { type: String },
      time: { type: String }
    }
  ],
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
WorkdateSchema.plugin(paginate);
WorkdateSchema.plugin(relationship, { relationshipPathName: ['workrests', 'workmonth'] });

WorkdateSchema.statics.addWorkrest = function (workrestId, year, month, date) {
  return this.find({ year: year, month: month, date: date })
    .exec(function (err, workdates) {
      if (err || workdates.length === 0) return;
      for (var index = 0; index < workdates.length; index++) {
        const element = workdates[index];
        element.workrests.push(workrestId);
        element.save();
      }
    });
};

WorkdateSchema.statics.removeWorkrest = function (workrestId, year, month, date) {
  return this.find({ year: year, month: month, date: date })
    .exec(function (err, workdates) {
      if (err || workdates.length === 0) return;
      for (var index = 0; index < workdates.length; index++) {
        const element = workdates[index];
        element.workrests.pull(workrestId);
        element.save();
      }
    });
};


WorkdateSchema.statics.setTransfer = function (workdateId, isTransfer) {
  return this.findById(workdateId)
    .exec(function (err, workdate) {
      if (!workdate) return;
      workdate.transfer = isTransfer;
      workdate.save();
    });
};

mongoose.model('Workdate', WorkdateSchema);
