// Notifs service used to communicate Notifs REST endpoints
(function () {
  'use strict';

  angular
    .module('core')
    .service('Notifications', Notifications);

  Notifications.$inject = ['$http'];
  function Notifications($http) {
    var sv = {};
    sv.cnt = 0;
    sv.notifications = [];

    sv.count = function () {
      $http.get('/api/notifs/count', { ignoreLoadingBar: true })
        .success(function (res) { sv.cnt = res; });
    };
    sv.clear = function () {
      $http.get('/api/notifs/clear', { ignoreLoadingBar: true })
        .success(function () {
          sv.cnt = 0;
        });
    };
    sv.remove = function (notif) {
      return $http.get('/api/notifs/' + notif + '/remove', { ignoreLoadingBar: true })
        .success(function (res) {
          sv.cnt = res;
        });
    };
    return sv;
  }
}());
