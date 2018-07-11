(function (app) {
  'use strict';
  app.registerModule('payments');
  app.registerModule('payments.admin', ['core.admin']);
}(ApplicationConfiguration));
