// Workdates service used to communicate Workdates REST endpoints
(function () {
  'use strict';

  angular
    .module('workdates')
    .factory('WorkdatesService', WorkdatesService)
    .factory('WorkdatesApi', WorkdatesApi);

  WorkdatesService.$inject = ['$resource'];

  function WorkdatesService($resource) {
    return $resource('api/workdates/:workdateId', { workdateId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }

  WorkdatesApi.$inject = ['$http'];
  function WorkdatesApi($http) {
    this.getWorkrestsInWorkdate = function (workdateId) {
      return $http.post('/api/workdates/' + workdateId + '/workrests', {}, { ignoreLoadingBar: true });
    };
    this.addComment = function (workdateId, comment) {
      return $http.post('/api/workdates/' + workdateId + '/add_comment', { comment: comment }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
