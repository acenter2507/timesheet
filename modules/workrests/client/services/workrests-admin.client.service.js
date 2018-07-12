// Workrests service used to communicate Workrests REST endpoints
(function () {
  'use strict';

  angular
    .module('workrests.admin')
    .factory('WorkrestsAdminApi', WorkrestsAdminApi);

  WorkrestsAdminApi.$inject = ['$http'];
  function WorkrestsAdminApi($http) {
    this.reviews = function (condition, page) {
      return $http.post('/api/workrests/admin/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    };
    this.approve = function (workrestId) {
      return $http.post('/api/workrests/admin/' + workrestId + '/approve', { ignoreLoadingBar: true });
    };
    this.reject = function (workrestId, data) {
      return $http.post('/api/workrests/admin/' + workrestId + '/reject', { data: data }, { ignoreLoadingBar: true });
    };

    // this.getWorkrestsToday = function (date) {
    //   return $http.post('/api/workrests/today', { date: date }, { ignoreLoadingBar: true });
    // };
    // this.getRestOfCurrentUser = function (condition, page) {
    //   return $http.post('/api/workrests/owner', { condition: condition, page: page }, { ignoreLoadingBar: true });
    // };
    // this.getRestOfCurrentUserInRange = function (start, end, userId) {
    //   return $http.post('/api/workrests/owner_in_range', { start: start, end: end, userId: userId }, { ignoreLoadingBar: true });
    // };
    // this.getRestReview = function (condition, page) {
    //   return $http.post('/api/workrests/review', { condition: condition, page: page }, { ignoreLoadingBar: true });
    // };
    // this.request = function (workrestId) {
    //   return $http.post('/api/workrests/' + workrestId + '/request', null, { ignoreLoadingBar: true });
    // };
    // this.cancel = function (workrestId) {
    //   return $http.post('/api/workrests/' + workrestId + '/cancel', null, { ignoreLoadingBar: true });
    // };
    // this.requestDelete = function (workrestId) {
    //   return $http.post('/api/workrests/' + workrestId + '/requestDelete', null, { ignoreLoadingBar: true });
    // };
    return this;
  }
}());
