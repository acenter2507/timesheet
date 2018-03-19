'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Month Schema
 */
var MonthSchema = new Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  // 1-Unsend, 2-Watting, 3-Approve, 4-Reject
  status: { type: Number, default: 1 },
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
  workDates: [{ type: Schema.ObjectId, ref: 'Workdate' }],
  search: { type: String },
  department: { type: Schema.ObjectId, ref: 'Department' },
  // Roles
  roles: {
    type: [{
      type: String,
      enum: ['user', 'accountant', 'manager', 'admin']
    }],
    default: ['user'],
    required: 'Please provide at least one role'
  },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
MonthSchema.plugin(paginate);

mongoose.model('Month', MonthSchema);
