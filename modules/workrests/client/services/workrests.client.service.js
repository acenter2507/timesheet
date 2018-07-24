// Workrests service used to communicate Workrests REST endpoints
(function () {
  'use strict';

  angular
    .module('workrests')
    .factory('WorkrestsService', WorkrestsService)
    .factory('WorkrestsApi', WorkrestsApi);

  WorkrestsService.$inject = ['$resource'];

  function WorkrestsService($resource) {
    return $resource('api/workrests/:workrestId', { workrestId: '@_id' }, {
      save: { method: 'POST', ignoreLoadingBar: true },
      get: { method: 'GET', ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      remove: { method: 'DELETE', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
  WorkrestsApi.$inject = ['$http'];
  function WorkrestsApi($http) {
    this.list = function (condition, page) {
      return $http.post('/api/workrests/list', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.request = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/cancel', null, { ignoreLoadingBar: true });
    };
    this.requestDelete = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/requestDelete', null, { ignoreLoadingBar: true });
    };

    
    this.getWorkrestsToday = function (date) {
      return $http.post('/api/workrests/today', { date: date }, { ignoreLoadingBar: true });
    };
    this.getRestOfCurrentUserInRange = function (start, end, userId) {
      return $http.post('/api/workrests/owner_in_range', { start: start, end: end, userId: userId }, { ignoreLoadingBar: true });
    };
    this.getRestReview = function (condition, page) {
      return $http.post('/api/workrests/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
