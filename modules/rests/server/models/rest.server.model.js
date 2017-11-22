'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Rest Schema
 */
var RestSchema = new Schema({
  holiday: { type: Schema.ObjectId, ref: 'Holiday' },
  // Start vacation
  start: { type: Date },
  // End vacation
  end: { type: Date },
  // Duration of vacation
  duration: { type: Number },
  // Reason of vacation
  description: { type: String },
  // Status of vacation: 1:Not send - 2:Waiting - 3:Approved - 4:Rejected - 5:Done
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
  // Create date
  created: { type: Date, default: Date.now },
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
  // User
  user: { type: Schema.ObjectId, ref: 'User' }
});

RestSchema.plugin(paginate);

RestSchema.statics.addHistory = function (restId, history) {
  return this.findById(restId).exec(function (err, rest) {
    if (err || !rest) return;
    rest.historys.push(history);
    return rest.save();
  });
};

RestSchema.statics.changeStatus = function (restId, status) {
  return this.findById(restId).exec(function (err, rest) {
    if (err || !rest) return;
    rest.status = status;
    return rest.save();
  });
};
mongoose.model('Rest', RestSchema);
