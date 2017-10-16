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
      './modules/departments/client/img/dep1.png',
      './modules/departments/client/img/dep2.png',
      './modules/departments/client/img/dep3.png',
      './modules/departments/client/img/dep4.png',
      './modules/departments/client/img/dep5.png',
      './modules/departments/client/img/dep6.png',
      './modules/departments/client/img/dep7.png',
      './modules/departments/client/img/dep8.png',
      './modules/departments/client/img/dep9.png',
      './modules/departments/client/img/dep10.png',
      './modules/departments/client/img/dep11.png',
      './modules/departments/client/img/dep12.png',
      './modules/departments/client/img/dep13.png',
      './modules/departments/client/img/dep14.png',
      './modules/departments/client/img/dep15.png',
      './modules/departments/client/img/dep16.png',
      './modules/departments/client/img/dep17.png',
      './modules/departments/client/img/dep18.png',
      './modules/departments/client/img/dep19.png',
      './modules/departments/client/img/dep20.png',
      './modules/departments/client/img/dep21.png',
      './modules/departments/client/img/dep22.png',
      './modules/departments/client/img/dep23.png',
      './modules/departments/client/img/dep24.png'
    ];

    onCreate();
    function onCreate() {
      vm.avatarImageUrl = vm.department.avatar || './modules/departments/client/img/default.png';
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
      if (vm.department._id) {
        vm.department.$update(successCallback, errorCallback);
      } else {
        vm.department.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('departments.view', {
          departmentId: res._id
        });
      }

      function errorCallback(res) {
        $scope.handleShowToast(res.data.message, true);
      }
      vm.cancelUpload();
    };
    // Called after the user has failed to uploaded a new picture
    vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
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
    vm.handleSaveDepartment = isValid => {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.departmentForm');
        return false;
      }
      vm.uploader.uploadAll();
    };

    //
    vm.handleSelectImageLibrary = () => {
      $scope.selectedImage = '';
      var mDialog = ngDialog.open({
        template: 'modules/core/client/views/templates/images-library.dialog.template.html',
        scope: $scope
      });
      mDialog.closePromise.then(function (res) {
        console.log(res);
        if (!res.value || res.value === '') return;
        vm.avatarImageUrl = res.value;
        vm.department.avatar = res.value;
        delete $scope.selectedImage;
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
  }
}());
