'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Workrest Schema
 */
var WorkrestSchema = new Schema({
  holiday: { type: Schema.ObjectId, ref: 'Holiday' },
  // start: {
  //   year: { type: String },
  //   month: { type: String },
  //   date: { type: String }
  // },
  // end: {
  //   year: { type: String },
  //   month: { type: String },
  //   date: { type: String }
  // },
  // Start vacation
  start: { type: Date },
  // End vacation
  end: { type: Date },
  // Duration of vacation
  duration: { type: Number, default: 0 },
  // Thời gian tính khi nghỉ
  hours: { type: Number, default: 0 },
  // Reason of vacation
  description: { type: String },
  // Status of vacation: 1:Not send - 2:Waiting - 3:Approved - 4:Rejected - 5:Request delete
  status: { type: Number },
  // search
  search: { type: String },
  // Department
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
  // Warning
  warning: { type: String },
  // Create date
  created: { type: Date, default: Date.now },
  historys: [{
    // Action of history 1:Created - 2:Updated - 3:Send - 4:Approved - 5:Rejected - 6:Cancel request
    action: { type: Number },
    // Comment of history
    comment: { type: String },
    // Time of history
    timing: { type: Date },
    // Owner
    user: { type: Schema.ObjectId, ref: 'User' },
  }],
  // User
  user: { type: Schema.ObjectId, ref: 'User' }
});
WorkrestSchema.plugin(paginate);

WorkrestSchema.statics.addHistory = function (workrestId, history) {
  return this.findById(workrestId).exec(function (err, workrest) {
    if (err || !workrest) return;
    workrest.historys.push(history);
    return workrest.save();
  });
};

WorkrestSchema.statics.changeStatus = function (workrestId, status) {
  return this.findById(workrestId).exec(function (err, workrest) {
    if (err || !workrest) return;
    workrest.status = status;
    return workrest.save();
  });
};
mongoose.model('Workrest', WorkrestSchema);
