'use strict';

/**
 * Module dependencies
 */
var roomsPolicy = require('../policies/rooms.server.policy'),
  rooms = require('../controllers/rooms.server.controller'),
  bookings = require('../controllers/bookings.server.controller'),
  bookings_admin = require('../controllers/bookings-admin.server.controller'),
  rooms_admin = require('../controllers/rooms-admin.server.controller');

module.exports = function (app) {

  app.route('/api/rooms').all(roomsPolicy.isAllowed)
    .get(rooms.list)
    .post(rooms.create);

  app.route('/api/rooms/:roomId').all(roomsPolicy.isAllowed)
    .get(rooms.read)
    .put(rooms.update)
    .delete(rooms.delete);

  // ADMIN
  app.route('/api/rooms/admin/images').all(roomsPolicy.isAllowed).post(rooms_admin.images);
  app.route('/api/rooms/admin/:roomId/deleteImage').all(roomsPolicy.isAllowed).post(rooms_admin.deleteImage);
  app.route('/api/rooms/admin/:roomId/bookings').all(roomsPolicy.isAllowed).post(rooms_admin.bookings);

  // BOOKINGS
  app.route('/api/bookings/rooms').all(roomsPolicy.isAllowed).post(bookings.rooms);
  app.route('/api/bookings/waiting').all(roomsPolicy.isAllowed).post(bookings.waiting);

  app.route('/api/bookings').all(roomsPolicy.isAllowed)
    .get(bookings.list)
    .post(bookings.create);
  app.route('/api/bookings/:roomId').all(roomsPolicy.isAllowed)
    .get(bookings.read)
    .put(bookings.update)
    .delete(bookings.delete);

  app.route('/api/bookings/admin/:bookingId/reject').all(roomsPolicy.isAllowed).post(bookings_admin.reject);

  // Finish by binding the Room middleware
  app.param('roomId', rooms.roomByID);
  app.param('bookingId', bookings.bookingByID);
};
