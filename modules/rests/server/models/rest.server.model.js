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
  // Kind of Rest: 1:有給休暇 / 2:午前半休　/ 3:午後半休 / 4:振替休暇 / 5:特別休暇 / 6:看護休暇 / 7:介護休暇 / 8:生理休暇
  kind: { type: Number, default: 0, required: true },
  start: { type: Date },
  end: { type: Date },
  duration: { type: Number },
  description: { type: String },
  status: { type: Number },
  comment: { type: String },
  approved: { type: Schema.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});

RestSchema.plugin(paginate);
mongoose.model('Rest', RestSchema);
