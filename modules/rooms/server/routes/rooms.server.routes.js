'use strict';

/**
 * Module dependencies
 */
var roomsPolicy = require('../policies/rooms.server.policy'),
  rooms = require('../controllers/rooms.server.controller');

module.exports = function(app) {
  // Rooms Routes
  app.route('/api/rooms').all(roomsPolicy.isAllowed)
    .get(rooms.list)
    .post(rooms.create);

  app.route('/api/rooms/:roomId').all(roomsPolicy.isAllowed)
    .get(rooms.read)
    .put(rooms.update)
    .delete(rooms.delete);

  // Finish by binding the Room middleware
  app.param('roomId', rooms.roomByID);
};
