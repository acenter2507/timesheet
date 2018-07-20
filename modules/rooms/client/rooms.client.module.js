(function (app) {
  'use strict';

  app.registerModule('rooms');
  app.registerModule('rooms.admin', ['core.admin']);
}(ApplicationConfiguration));
