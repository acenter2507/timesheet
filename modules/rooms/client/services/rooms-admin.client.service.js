(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .factory('RoomsAdminApi', RoomsAdminApi);

  RoomsAdminApi.$inject = ['$http'];
  function RoomsAdminApi($http) {
    return this;
  }
}());
