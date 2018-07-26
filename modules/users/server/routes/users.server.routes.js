'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);

  app.route('/api/users/profile').post(users.profile);
  app.route('/api/users/password').post(users.password);
  app.route('/api/users/picture').post(users.picture);
  app.route('/api/users/autocomplete').post(users.autocomplete);
};
