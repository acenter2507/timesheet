// Workdates service used to communicate Workdates REST endpoints
(function () {
  'use strict';

  angular
    .module('workdates')
    .factory('WorkdatesService', WorkdatesService)
    .factory('WorkdatesApi', WorkdatesApi);

  WorkdatesService.$inject = ['$resource'];

  function WorkdatesService($resource) {
    return $resource('api/workdates/:workdateId', {
      workdateId: '@_id'
    }, {
        update: {
          method: 'PUT'
        }
      });
  }

  WorkdatesApi.$inject = ['$http'];
  function WorkdatesApi($http) {
    this.getWorkrestsInWorkdate = (workdateId) => {
      return $http.post('/api/workdates/' + workrestId + '/workrests', {}, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
