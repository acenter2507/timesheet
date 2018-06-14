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
      update: {
        method: 'PUT'
      }
    });
  }
  WorkrestsApi.$inject = ['$http'];
  function WorkrestsApi($http) {
    this.getWorkrestsToday = function (date) {
      return $http.post('/api/workrests/today', { date: date }, { ignoreLoadingBar: true });
    };
    this.getRestOfCurrentUser = function (condition, page) {
      return $http.post('/api/workrests/owner', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.getRestOfCurrentUserInRange = function (start, end, userId) {
      return $http.post('/api/workrests/owner_in_range', { start: start, end: end, userId: userId }, { ignoreLoadingBar: true });
    };
    this.getRestReview = function (condition, page) {
      return $http.post('/api/workrests/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/approve', { ignoreLoadingBar: true });
    };
    this.reject = function (workrestId, data) {
      return $http.post('/api/workrests/' + workrestId + '/reject', { data: data }, { ignoreLoadingBar: true });
    };
    this.request = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/request', null, { ignoreLoadingBar: true });
    };
    this.cancel = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/cancel', null, { ignoreLoadingBar: true });
    };
    this.deleteRequest = function (workrestId) {
      return $http.post('/api/workrests/' + workrestId + '/deleteRequest', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
