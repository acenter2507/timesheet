'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Month Schema
 */
var MonthSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Month name',
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

mongoose.model('Month', MonthSchema);
