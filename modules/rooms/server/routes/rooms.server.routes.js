'use strict';

/**
 * Module dependencies
 */
var roomsPolicy = require('../policies/rooms.server.policy'),
  rooms = require('../controllers/rooms.server.controller'),
  rooms_admin = require('../controllers/rooms-admin.server.controller');

module.exports = function(app) {

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

  // Finish by binding the Room middleware
  app.param('roomId', rooms.roomByID);
};
