'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Workdate Schema
 */
var WorkdateSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Workdate name',
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

mongoose.model('Workdate', WorkdateSchema);
