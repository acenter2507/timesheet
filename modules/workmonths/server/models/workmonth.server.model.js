'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Workmonth Schema
 */
var WorkmonthSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Workmonth name',
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

mongoose.model('Workmonth', WorkmonthSchema);
