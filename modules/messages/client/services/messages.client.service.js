// Messages service used to communicate Messages REST endpoints
(function () {
  'use strict';

  angular
    .module('messages')
    .factory('MessagesService', MessagesService);

  MessagesService.$inject = ['$resource'];

  function MessagesService($resource) {
    return $resource('api/messages/:messageId', { messageId: '@_id' }, {
      get: { ignoreLoadingBar: true },
      update: { method: 'PUT', ignoreLoadingBar: true },
      query: { isArray: true, ignoreLoadingBar: true }
    });
  }
}());
