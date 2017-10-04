'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Department Schema
 */
var DepartmentSchema = new Schema({
  // Tên của bộ phận
  name: { type: String, required: 'Please fill Department name', trim: true },
  // Địa điểm của bộ phận
  location: { type: String, default: '' },
  // Leader (nhiều leader)
  leaders: [{ type: Schema.ObjectId, ref: 'User' }],
  // Member của bộ phận
  members: [{ type: Schema.ObjectId, ref: 'User' }],
  // Thông số báo cáo
  report: { memberCnt: { type: Number, default: 0 } },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
DepartmentSchema.plugin(paginate);

mongoose.model('Department', DepartmentSchema);
