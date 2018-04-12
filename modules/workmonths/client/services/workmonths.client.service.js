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
    return this;
  }
}());
