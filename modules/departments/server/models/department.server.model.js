'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  relationship = require('mongoose-relationship'),
  Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
  name: { type: String, required: 'Please fill Department name', trim: true },
  email: { type: String },
  location: { type: String, default: '' },
  members: [{ type: Schema.ObjectId, ref: 'User', childPath: 'departments' }],
  created: { type: Date, default: Date.now },
  avatar: { type: String, default: './modules/core/client/img/gallerys/default.png' },
  user: { type: Schema.ObjectId, ref: 'User' }
});
DepartmentSchema.plugin(paginate);
DepartmentSchema.plugin(relationship, { relationshipPathName: 'members' });

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
DepartmentSchema.statics.removeMember = function (departmentId, userId) {
  return this.findById(departmentId).exec(function (err, department) {
    if (err || !department) return;
    department.members.pull(userId);
    return department.save();
  });
};

mongoose.model('Department', DepartmentSchema);
