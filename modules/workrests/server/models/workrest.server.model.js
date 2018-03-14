'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Workrest Schema
 */
var WorkrestSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Workrest name',
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

mongoose.model('Workrest', WorkrestSchema);
