'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

/**
 * Holiday Schema
 */
var HolidaySchema = new Schema({
  name: { type: String, default: '', required: true, trim: true },
  isPaid: { type: Boolean, default: false },
  // Thời gian tính tương đương
  hours: { type: Number, default: 0 },
  // Đơn vị tính
  unit: { type: Number, default: 0 },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
HolidaySchema.plugin(paginate);

mongoose.model('Holiday', HolidaySchema);
