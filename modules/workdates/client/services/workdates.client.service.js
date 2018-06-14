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
      update: {
        method: 'PUT'
      }
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
