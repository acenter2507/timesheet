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
  // Email
  email: { type: String },
  // Địa điểm của bộ phận
  location: { type: String, default: '' },
  // Leader (nhiều leader)
  leaders: [{ type: Schema.ObjectId, ref: 'User' }],
  // Member của bộ phận
  members: [{ type: Schema.ObjectId, ref: 'User' }],
  // Thông số báo cáo
  report: { memberCnt: { type: Number, default: 0 } },
  created: { type: Date, default: Date.now },
  avatar: { type: String, default: './modules/core/client/img/gallerys/default.png' },
  user: { type: Schema.ObjectId, ref: 'User' }
});
DepartmentSchema.plugin(paginate);

DepartmentSchema.statics.addLeader = function (departmentId, userId) {
  return this.findById(departmentId).exec(function (err, department) {
    if (err || !department) return;
    var isHas = false;
    for (var index = 0; index < department.leaders.length; index++) {
      var element = department.leaders[index];
      if (element.toString() === userId.toString()) {
        isHas = true;
        break;
      }
    }
    if (!isHas) {
      department.leaders.push(userId);
      return department.save();
    }
    return;
  });
};

DepartmentSchema.statics.addMember = function (departmentId, userId) {
  return this.findById(departmentId).exec(function (err, department) {
    if (err || !department) return;
    var isHas = false;
    for (var index = 0; index < department.members.length; index++) {
      var element = department.members[index];
      if (element.toString() === userId.toString()) {
        isHas = true;
        break;
      }
    }
    if (!isHas) {
      department.members.push(userId);
      return department.save();
    }
    return;
  });
};

DepartmentSchema.statics.removeLeader = function (departmentId, userId) {
  return this.findById(departmentId).exec(function (err, department) {
    if (err || !department) return;
    department.leaders.pull(userId);
    return department.save();
  });
};

DepartmentSchema.statics.removeMember = function (departmentId, userId) {
  return this.findById(departmentId).exec(function (err, department) {
    if (err || !department) return;
    department.members.pull(userId);
    return department.save();
  });
};

mongoose.model('Department', DepartmentSchema);
