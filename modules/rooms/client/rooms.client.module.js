(function (app) {
  'use strict';

  app.registerModule('rooms');
  app.registerModule('rooms.admin', ['core.admin']);
  app.registerModule('bookings');
  app.registerModule('bookings.admin', ['core.admin']);
}(ApplicationConfiguration));
