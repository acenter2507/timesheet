(function (app) {
  'use strict';

  app.registerModule('workdates');
  app.registerModule('workdates.admin', ['core.admin']);
}(ApplicationConfiguration));
