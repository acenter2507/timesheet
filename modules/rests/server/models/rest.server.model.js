'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Rest Schema
 */
var RestSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Rest name',
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

mongoose.model('Rest', RestSchema);
