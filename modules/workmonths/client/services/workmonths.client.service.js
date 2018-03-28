// Workmonths service used to communicate Workmonths REST endpoints
(function () {
  'use strict';

  angular
    .module('workmonths')
    .factory('WorkmonthsService', WorkmonthsService)
    .factory('WorkmonthsApi', MonthsApi);

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
      return $http.post('/api/months/workmonthsByYearAndUser', { year: year, userId: userId }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
