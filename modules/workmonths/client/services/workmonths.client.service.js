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
      get: { ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { ignoreLoadingBar: true }
    });
  }
  WorkmonthsApi.$inject = ['$http'];
  function WorkmonthsApi($http) {
    this.getWorkMonthsByYearAndUser = function (year, userId) {
      return $http.post('/api/workmonths/workmonthsByYearAndUser', { year: year, userId: userId }, { ignoreLoadingBar: true });
    };
    this.getHolidayWorking = function (workmonthId) {
      return $http.post('/api/workmonths/getHolidayWorking', { workmonthId: workmonthId }, { ignoreLoadingBar: true });
    };
    this.getWorkmonthsReview = function (condition, page) {
      return $http.post('/api/workmonths/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/approve', null, { ignoreLoadingBar: true });
    };
    this.reject = function (workmonthId, data) {
      return $http.post('/api/workmonths/' + workmonthId + '/reject', { data: data }, { ignoreLoadingBar: true });
    };
    this.request = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = function (workmonthId) {
      return $http.post('/api/workmonths/' + workmonthId + '/cancel', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
