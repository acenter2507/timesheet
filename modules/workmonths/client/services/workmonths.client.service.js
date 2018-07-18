// Workmonths service used to communicate Workmonths REST endpoints
(function () {
  'use strict';

  angular
    .module('workmonths')
    .factory('WorkmonthsService', WorkmonthsService)
    .factory('WorkmonthsApi', WorkmonthsApi);

  WorkmonthsService.$inject = ['$resource'];

  function WorkmonthsService($resource) {
    return $resource('api/workmonths/:workmonthId', { workmonthId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
  WorkmonthsApi.$inject = ['$http'];
  function WorkmonthsApi($http) {
    this.list = function (year) {
      return $http.post('/api/workmonths/list', { year: year }, { ignoreLoadingBar: true });
    };
    this.getHolidayWorking = function (workmonthId) {
      return $http.post('/api/workmonths/getHolidayWorking', { workmonthId: workmonthId }, { ignoreLoadingBar: true });
    };
    this.request = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/cancel', null, { ignoreLoadingBar: true });
    };
    this.requestDelete = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/requestDelete', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
