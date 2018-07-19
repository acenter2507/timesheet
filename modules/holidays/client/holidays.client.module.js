(function (app) {
  'use strict';

  app.registerModule('holidays');
  app.registerModule('holidays.admin', ['core.admin']);
}(ApplicationConfiguration));
