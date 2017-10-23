(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments')
    .controller('InputDepartmentController', InputDepartmentController);

  InputDepartmentController.$inject = ['$window', '$scope', '$state', 'departmentResolve', 'FileUploader', 'ngDialog', '$timeout'];

  function InputDepartmentController($window, $scope, $state, department, FileUploader, ngDialog, $timeout) {
    var vm = this;

    vm.department = department;
    vm.form = {};
    vm.uploader = {};
    $scope.gallery = [
      './modules/core/client/img/gallerys/dep1.png',
      './modules/core/client/img/gallerys/dep2.png',
      './modules/core/client/img/gallerys/dep3.png',
      './modules/core/client/img/gallerys/dep4.png',
      './modules/core/client/img/gallerys/dep5.png',
      './modules/core/client/img/gallerys/dep6.png',
      './modules/core/client/img/gallerys/dep7.png',
      './modules/core/client/img/gallerys/dep8.png',
      './modules/core/client/img/gallerys/dep9.png',
      './modules/core/client/img/gallerys/dep10.png',
      './modules/core/client/img/gallerys/dep11.png',
      './modules/core/client/img/gallerys/dep12.png',
      './modules/core/client/img/gallerys/dep13.png',
      './modules/core/client/img/gallerys/dep14.png',
      './modules/core/client/img/gallerys/dep15.png',
      './modules/core/client/img/gallerys/dep16.png',
      './modules/core/client/img/gallerys/dep17.png',
      './modules/core/client/img/gallerys/dep18.png',
      './modules/core/client/img/gallerys/dep19.png',
      './modules/core/client/img/gallerys/dep20.png',
      './modules/core/client/img/gallerys/dep21.png',
      './modules/core/client/img/gallerys/dep22.png',
      './modules/core/client/img/gallerys/dep23.png',
      './modules/core/client/img/gallerys/dep24.png'
    ];
    vm.isGetAvatarFromFile = false;
    vm.busy = false;

    onCreate();
    function onCreate() {
      vm.avatarImageUrl = vm.department.avatar || './modules/core/client/img/gallerys/default.png';
      prepareUploader();
    }

    function prepareUploader() {
      vm.uploader = new FileUploader({
        url: 'api/departments/avatar',
        alias: 'departmentAvatar'
      });
      vm.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
    }

    // Called after the user selected a new picture file
    vm.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            // $scope.imageURL = fileReaderEvent.target.result;
            handleCropImage(fileReaderEvent.target.result);
          }, 0);
        };
      }
    };
    // Called after the user has successfully uploaded a new picture
    vm.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      vm.department.avatar = response;
      handleSaveDepartment();
      vm.cancelUpload();
    };
    // Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
      vm.busy = false;
      $scope.handleShowToast(response, true);
      // Clear upload buttons
      vm.cancelUpload();
    };
    // Change user profile picture
    function handleCropImage(data) {
      $scope.sourceImageUrl = data;
      $scope.desImageUrl = {};
      var mDialog = ngDialog.open({
        template: 'modules/core/client/views/templates/crop-image.dialog.template.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value) return;
        vm.avatarImageUrl = res.value;
        var blob = dataURItoBlob(res.value);
        vm.uploader.queue[0]._file = blob;
        delete $scope.sourceImageUrl;
        vm.isGetAvatarFromFile = true;
      });
    }
    // Cancel the upload process
    vm.cancelUpload = function () {
      vm.uploader.clearQueue();
    };
    // Remove existing Department
    vm.handleDeleteDepartment = () => {
      $scope.handleShowConfirm({
        message: vm.department.name + 'を削除しますか？'
      }, () => {
        vm.department.$remove($state.go('departments.list'));
      });
    };

    // Save Department
    vm.handleStartSave = isValid => {
      if (vm.busy) return;
      vm.busy = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.departmentForm');
        vm.busy = false;
        return false;
      }
      if (vm.isGetAvatarFromFile) {
        vm.uploader.uploadAll();
      } else {
        handleSaveDepartment();
      }

    };

    function handleSaveDepartment() {
      if (vm.department._id) {
        vm.department.$update(successCallback, errorCallback);
      } else {
        vm.department.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        vm.busy = false;
        $state.go('departments.view', {
          departmentId: res._id
        });
      }

      function errorCallback(res) {
        vm.busy = false;
        $scope.handleShowToast(res.data.message, true);
      }
    }

    // Select image from gallery
    vm.handleSelectImageGallery = () => {
      $scope.selectedImage = '';
      var mDialog = ngDialog.open({
        template: 'modules/core/client/views/templates/images-gallery.dialog.template.html',
        scope: $scope,
        closeByDocument: false,
        showClose: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '') return;
        vm.avatarImageUrl = res.value;
        vm.department.avatar = res.value;
        delete $scope.selectedImage;
        vm.isGetAvatarFromFile = false;
      });
    };
    // Cancel
    vm.handleCancelInput = () => {
      $scope.handleShowConfirm({
        message: '操作を止めますか？'
      }, () => {
        handlePreviousScreen();
      });
    };
    // Change image from URI to blob
    function dataURItoBlob(dataURI) {
      var binary = atob(dataURI.split(',')[1]);
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
      var array = [];
      for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      return new Blob([new Uint8Array(array)], { type: mimeString });
    }
    // Trở về màn hình trước
    function handlePreviousScreen() {
      $state.go($state.previous.state.name || 'users.list', $state.previous.params);
    }
  }
}());
