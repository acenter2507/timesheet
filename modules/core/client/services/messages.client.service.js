// Notifs service used to communicate Notifs REST endpoints
(function () {
  'use strict';

  angular
    .module('core')
    .service('Messages', Messages);

    Messages.$inject = ['$http'];
  function Messages($http) {
    var sv = {};
    sv.cnt = 0;
    sv.messages = [];
    return sv;
  }
}());
