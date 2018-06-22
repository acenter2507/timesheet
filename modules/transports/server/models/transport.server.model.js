'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Transport Schema
 */
var TransportSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Transport name',
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

mongoose.model('Transport', TransportSchema);
