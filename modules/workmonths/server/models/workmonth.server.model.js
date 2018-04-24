'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  _ = require('underscore'),
  Schema = mongoose.Schema;

/**
 * Workmonth Schema
 */
var WorkmonthSchema = new Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  // 1-Unsend, 2-Watting, 3-Approve, 4-Reject, 5: Lock
  status: { type: Number, default: 1 },
  workdates: [{ type: Schema.ObjectId, ref: 'Workdate' }],
  department: { type: Schema.ObjectId, ref: 'Department' },
  // Số ngày làm việc trong 1 tháng
  numWorkDate: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 }, // 時間外
  overnight: { type: Number, default: 0 }, // 深夜
  middleRest: { type: Number, default: 0 }, // 休憩 (hour)
  search: { type: String },
  // Roles
  roles: {
    type: [{
      type: String,
      enum: ['user', 'accountant', 'manager', 'admin']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  historys: [{
    // Action of history 1:Created - 2:Updated - 3:Send - 4:Approved - 5:Rejected - 6:Using
    action: { type: Number },
    // Comment of history
    comment: { type: String },
    // Time of history
    timing: { type: Date },
    // Owner
    user: { type: Schema.ObjectId, ref: 'User' },
  }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
WorkmonthSchema.plugin(paginate);

WorkmonthSchema.statics.calculatorWorkdates = function (workmonthId) {
  return this.findById(workmonthId)
    .populate('workdates')
    .exec((err, workmonth) => {
      if (err || !workmonth) return;
      if (workmonth.workdates.length === 0) return;
      var numWorkDate = 0, overtime = 0, overnight = 0, middleRest = 0;
      for (let index = 0; index < workmonth.workdates.length; index++) {
        const workdate = workmonth.workdates[index];
        // Cộng ngày làm việc
        if (workdate.start && workdate.start !== '') {
          numWorkDate += 1;
        }
        // Cộng thời gian nghỉ giải lao
        middleRest += workdate.middleRest;
        overtime += workdate.overtime;
        overnight += workdate.overnight;
      }
      workmonth.middleRest = middleRest;
      workmonth.numWorkDate = numWorkDate;
      workmonth.overtime = overtime;
      workmonth.overnight = overnight;
      return workmonth.save();
    });
};

WorkmonthSchema.statics.updateStatusTransfers = function (workmonthId) {
  return this.findById(workmonthId)
    .populate('workdates')
    .exec((err, workmonth) => {
      if (err || !workmonth) return;
      if (workmonth.workdates.length === 0) return;
      var transfers = [];

      for (let i = 0; i < workmonth.workdates.length; i++) {
        const element = workmonth.workdates[i];
        if (element.transfers.length === 0) {
          continue;
        }
        for (let y = 0; y < element.transfers.length; y++) {
          const element = element.transfers[y].toString();
          if (!_.contains(transfers, element)) {
            transfers.push(element);
          }
          
        }
      }
      console.log(transfers);
      return;
    });
};


mongoose.model('Workmonth', WorkmonthSchema);
