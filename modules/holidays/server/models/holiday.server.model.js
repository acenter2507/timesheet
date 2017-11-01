'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Holiday Schema
 */
var HolidaySchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Holiday name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Holiday', HolidaySchema);
