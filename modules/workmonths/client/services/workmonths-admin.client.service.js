// Workmonths service used to communicate Workmonths REST endpoints
(function () {
  'use strict';

  angular
    .module('workmonths.admin')
    .factory('WorkmonthsAdminApi', WorkmonthsAdminApi);

  WorkmonthsAdminApi.$inject = ['$http'];
  function WorkmonthsAdminApi($http) {
    this.reviews = function (condition, page) {
      return $http.post('/api/workmonths/admin/reviews', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = function (workmonthId) {
      return $http.post('/api/workmonths/admin/' + workmonthId + '/approve', null, { ignoreLoadingBar: true });
    };
    this.reject = function (workmonthId) {
      return $http.post('/api/workmonths/admin/' + workmonthId + '/reject', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
