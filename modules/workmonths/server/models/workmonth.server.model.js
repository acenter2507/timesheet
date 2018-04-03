'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Workmonth Schema
 */
var WorkmonthSchema = new Schema({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  // 1-Unsend, 2-Watting, 3-Approve, 4-Reject
  status: { type: Number, default: 1 },
  workdates: [{ type: Schema.ObjectId, ref: 'Workdate' }],
  department: { type: Schema.ObjectId, ref: 'Department' },
  // Số ngày làm việc trong 1 tháng
  numWorkDate: { type: Number, default: 0  },
  overtime: { type: Number, default: 0 }, // 時間外
  overnight: { type: Number, default: 0 }, // 深夜
  middleRest: { type: Number, default: 0  }, // 休憩 (hour)
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

mongoose.model('Workmonth', WorkmonthSchema);
