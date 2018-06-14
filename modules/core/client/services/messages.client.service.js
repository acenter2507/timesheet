// Notifs service used to communicate Notifs REST endpoints
(function () {
  'use strict';

  angular
    .module('core')
    .service('Messages', Messages);

  Messages.$inject = ['$http'];
  function Messages($http) {
    var sv = {};
    sv.cnt = 0;
    sv.messages = [];
    sv.count = function () {
      $http.get('/api/messages/count', { ignoreLoadingBar: true })
        .success(function (res) { sv.cnt = res; });
    };
    sv.clear = function () {
      return new Promise(function (resolve, reject) {
        $http.get('/api/messages/clear', { ignoreLoadingBar: true })
          .success(function () {
            sv.cnt = 0;
            return resolve();
          });
      });
    };
    sv.remove = function (messageId) {
      return $http.get('/api/messages/' + messageId + '/remove', { ignoreLoadingBar: true })
        .success(function (res) {
          sv.cnt = res;
        });
    };
    return sv;
  }
}());
