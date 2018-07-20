(function () {
  'use strict';

  angular
    .module('rooms.admin')
    .factory('RoomsAdminApi', RoomsAdminApi);

  RoomsAdminApi.$inject = ['$http'];
  function RoomsAdminApi($http) {
    this.deleteImage = function (roomId, image) {
      return $http.post('/api/rooms/admin/' + roomId + '/deleteImage', { image: image }, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
