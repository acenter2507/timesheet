'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  paginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

var BookingSchema = new Schema({
  start: { type: Date },
  end: { type: Date },
  room: { type: Schema.ObjectId, ref: 'Room' },
  status: { type: Number, default: 1 },
  subject: { type: String },
  members: [{ type: Schema.ObjectId, ref: 'User' }],
  historys: [{
    action: { type: Number },
    timing: { type: Date },
    user: { type: Schema.ObjectId, ref: 'User' },
  }],
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});
BookingSchema.plugin(paginate);

mongoose.model('Booking', BookingSchema);
