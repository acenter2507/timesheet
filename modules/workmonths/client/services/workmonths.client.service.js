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
      update: {
        method: 'PUT'
      }
    });
  }
  WorkmonthsApi.$inject = ['$http'];
  function WorkmonthsApi($http) {
    this.getWorkMonthsByYearAndUser = (year, userId) => {
      return $http.post('/api/workmonths/workmonthsByYearAndUser', { year: year, userId: userId }, { ignoreLoadingBar: true });
    };
    this.getHolidayWorking = (workmonthId) => {
      return $http.post('/api/workmonths/getHolidayWorking', { workmonthId: workmonthId }, { ignoreLoadingBar: true });
    };
    this.approve = workmonthId => {
      return $http.post('/api/workmonths/' + workmonthId + '/approve', null, { ignoreLoadingBar: true });
    };
    this.reject = (workmonthId, data) => {
      return $http.post('/api/workmonths/' + workmonthId + '/reject', { data: data }, { ignoreLoadingBar: true });
    };
    this.request = workmonthId => {
      return $http.post('/api/workmonths/' + workmonthId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = workmonthId => {
      return $http.post('/api/workmonths/' + workmonthId + '/cancel', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
