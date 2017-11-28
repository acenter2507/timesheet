// Months service used to communicate Months REST endpoints
(function () {
  'use strict';

  angular
    .module('months')
    .factory('MonthsService', MonthsService)
    .factory('MonthsApi', MonthsApi);

  MonthsService.$inject = ['$resource'];

  function MonthsService($resource) {
    return $resource('api/months/:monthId', { monthId: '@_id' }, {
      update: {
        method: 'PUT'
      }
    });
  }
  MonthsApi.$inject = ['$http'];
  function MonthsApi($http) {
    this.getMonthsOfYearByUser = (year, userId) => {
      return $http.post('/api/months/getMonthsOfYearByUser', { year: year, userId: userId }, { ignoreLoadingBar: true });
    };
    
    return this;
  }
}());
