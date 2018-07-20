(function () {
  'use strict';

  // Rooms controller
  angular
    .module('rooms')
    .controller('RoomAdminController', RoomAdminController);

  RoomAdminController.$inject = [
    '$scope',
    '$state',
    'roomResolve',
    'FileUploader',
    'RoomsAdminApi'
  ];

  function RoomAdminController(
    $scope,
    $state,
    room,
    FileUploader,
    RoomsAdminApi) {

    var vm = this;
    vm.room = room;

    vm.form = {};

    onCreate();
    function onCreate() {
      prepareRoom();
      prepareUpload();
    }

    function prepareRoom() {
      if (!vm.room._id) {
        _.extend(vm.room, {
          seats: 1,
          projector: false,
          air_conditional: false,
          white_board: false,
          computer: 0,
          sound: false,
          images: []
        });
      }
    }
    function prepareUpload() {
      vm.uploader = new FileUploader({
        url: 'api/rooms/admin/images',
        alias: 'roomImages'
      });
      vm.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
      vm.uploader.onBeforeUploadItem = function (item) {
        vm.uploadingFileName = item._file.name;
      };
      vm.uploader.onAfterAddingAll = function (addedFileItems) {
      };
      vm.uploader.onCompleteItem = function (fileItem, response, status, headers) {
        vm.room.images.push(response);
      };
      vm.uploader.onCompleteAll = function () {
        vm.uploader.clearQueue();
        handleSaveRoom();
      };
    }
    vm.handleSaveRoom = function (isValid) {
      if (!isValid) {
        return $scope.$broadcast('show-errors-check-validity', 'vm.form.roomForm');
      }

      $scope.handleShowConfirm({
        message: '会議室を保存しますか？'
      }, function () {
        if (vm.uploader.queue.length > 0) {
          vm.uploader.uploadAll();
        } else {
          handleSaveRoom();
        }
      });
    };
    vm.handleDeleteImage = function (image) {
      RoomsAdminApi.deleteImage(vm.room._id, image)
        .success(function () {
          vm.room.images = _.without(vm.room.images, image);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    vm.handleCancel = function () {
      $state.go('admin.rooms.list');
    };

    function handleSaveRoom() {
      if (vm.room._id) {
        vm.room.$update(successCallback, errorCallback);
      } else {
        vm.room.$save(successCallback, errorCallback);
      }
      function successCallback(res) {
        $state.go('admin.rooms.view', { roomId: res._id });
      }
      function errorCallback(err) {
        $scope.handleShowToast(err.message, true);
      }
    }

    // // Remove existing Room
    // function remove() {
    //   if ($window.confirm('Are you sure you want to delete?')) {
    //     vm.room.$remove($state.go('rooms.list'));
    //   }
    // }

    // // Save Room
    // function save(isValid) {
    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.roomForm');
    //     return false;
    //   }

    //   // TODO: move create/update logic to service
    //   if (vm.room._id) {
    //     vm.room.$update(successCallback, errorCallback);
    //   } else {
    //     vm.room.$save(successCallback, errorCallback);
    //   }

    //   function successCallback(res) {
    //     $state.go('rooms.view', {
    //       roomId: res._id
    //     });
    //   }

    //   function errorCallback(res) {
    //     vm.error = res.data.message;
    //   }
    // }
  }
}());
