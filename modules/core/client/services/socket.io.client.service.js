'use strict';
angular.module('core')
  .service('mSocketFactory', mSocketFactory)
  .service('Socket', Socket);

mSocketFactory.$inject = ['socketFactory',];
function mSocketFactory(socketFactory) {
  return function (opts) {
    opts.ioSocket = opts.ioSocket || io.connect();
    var socket = socketFactory(opts);
    socket.socket = opts.ioSocket;
    return socket;
  };
}

Socket.$inject = ['Authentication', '$timeout', 'mSocketFactory', '$location',];
function Socket(Authentication, $timeout, mSocketFactory, $location) {
  // Connect to Socket.io server
  this.connect = function () {
    var protocol = $location.protocol();
    var host = $location.host();
    var port = $location.port();
    var url = protocol + '://' + host + ((port !== '') ? (':' + port) : '');
    this.socket = mSocketFactory({
      ioSocket: io.connect(url)
    });
  };
  this.connect();

  // Wrap the Socket.io 'on' method
  this.on = function (eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, function (data) {
        $timeout(function () {
          callback(data);
        });
      });
    }
  };

  // Wrap the Socket.io 'emit' method
  this.emit = function (eventName, data) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  };

  // Wrap the Socket.io 'removeListener' method
  this.removeListener = function (eventName) {
    if (this.socket) {
      this.socket.removeListener(eventName);
    }
  };
}
