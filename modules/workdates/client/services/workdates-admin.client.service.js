// Workdates service used to communicate Workdates REST endpoints
(function () {
  'use strict';

  angular
    .module('workdates.admin')
    .factory('WorkdatesAdminApi', WorkdatesAdminApi);

  WorkdatesAdminApi.$inject = ['$resource'];

  WorkdatesAdminApi.$inject = ['$http'];
  function WorkdatesAdminApi($http) {
    return this;
  }
}());
