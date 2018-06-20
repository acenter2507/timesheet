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
    // サーバーに存在しているメッセージを数える
    sv.count = function () {
      $http.get('/api/messages/count', { ignoreLoadingBar: true })
        .success(function (res) { sv.cnt = res; });
    };
    // サーバーに存在しているメッセージを消す
    sv.clear = function () {
      $http.get('/api/messages/clear', { ignoreLoadingBar: true })
        .success(function () {
          sv.cnt = 0;
        });
    };
    // Idでメッセージを消す
    sv.remove = function (messageId) {
      $http.get('/api/messages/' + messageId + '/remove', { ignoreLoadingBar: true })
        .success(function (res) {
          sv.cnt = res;
        });
    };
    // メッセージを見た時
    sv.open = function (messageId) {
      $http.get('/api/messages/' + messageId + '/open', { ignoreLoadingBar: true }).success(function () {
        sv.count();
      });
    };
    // メッセージをもっと見る機能
    sv.load = function (page) {
      return $http.post('/api/messages/load', { page: page }, { ignoreLoadingBar: true });
    };
    return sv;
  }
}());
