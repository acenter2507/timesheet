(function () {
  'use strict';

  // Departments controller
  angular
    .module('departments.admin')
    .controller('ManagerDepartmentController', ManagerDepartmentController);

  ManagerDepartmentController.$inject = [
    '$scope',
    '$state',
    'departmentResolve',
    'ManagerDepartmentsApi',
    'CommonService',
    '$q',
    'FileUploader',
    '$timeout',
    '$window',
    'ngDialog'
  ];

  function ManagerDepartmentController($scope, $state, department, ManagerDepartmentsApi, CommonService, $q, FileUploader, $timeout, $window, ngDialog) {
    var vm = this;

    vm.department = department;
    vm.form = {};
    vm.new_members = [];

    vm.busy = false;

    onCreate();
    function onCreate() {
      if (!vm.department._id) {
        vm.department.avatar = './modules/core/client/img/gallerys/default.png';
      }
      prepareGallery();
      vm.avatarImageUrl = vm.department.avatar;
      vm.isGetAvatarFromFile = false;
      prepareUploader();
    }
    function prepareGallery() {
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
    }
    function prepareUploader() {
      vm.uploader = new FileUploader({
        url: 'api/departments/manager/avatar',
        alias: 'departmentAvatar'
      });
      vm.uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) {
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
      });
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
        vm.uploader.clearQueue();
      };
      // Called after the user has failed to uploaded a new picture
      vm.uploader.onErrorItem = function (fileItem, response, status, headers) {
        vm.busy = false;
        $scope.handleShowToast(response, true);
        vm.uploader.clearQueue();
      };
    }
    function handleCropImage(data) {
      $scope.sourceImageUrl = data;
      $scope.desImageUrl = {};
      var mDialog = ngDialog.open({
        template: 'modules/core/client/views/templates/crop-image.dialog.template.html',
        scope: $scope,
        showClose: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '$document') {
          vm.uploader.clearQueue();
          vm.avatarImageUrl = vm.department.avatar;
          delete $scope.sourceImageUrl;
          return;
        }
        vm.avatarImageUrl = res.value;
        var blob = dataURItoBlob(res.value);
        vm.uploader.queue[0]._file = blob;
        vm.isGetAvatarFromFile = true;
        delete $scope.sourceImageUrl;
      });
    }

    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      CommonService.autocompleteUsers({ key: $query })
        .success(function (users) {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.handleAddMember = function () {
      if (vm.new_members.length === 0) return;
      var users = _.pluck(vm.new_members, '_id');
      ManagerDepartmentsApi.addMember(vm.department._id, users)
        .success(function (department) {
          vm.new_members = [];
          _.extend(vm.department, department);
          $scope.handleShowToast('メンバーを追加しました！', false);
        })
        .error(function (err) {
          $scope.handleShowToast(err.message, true);
        });
    };
    vm.handleRemoveMember = function (member) {
      $scope.handleShowConfirm({
        message: member.displayName + 'を削除しますか？'
      }, function () {
        ManagerDepartmentsApi.removeMember(vm.department._id, member._id)
          .success(function (department) {
            _.extend(vm.department, department);
            $scope.handleShowToast(member.displayName + 'を削除しました！', false);
          })
          .error(function (err) {
            $scope.handleShowToast(err.message, true);
          });
      });
    };
    vm.handleCancelAddMember = function () {
      vm.new_members = [];
    };
    vm.handleCancelAddMember = function () {
      vm.new_members = [];
    };
    vm.handleStartSave = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.departmentForm');
        return false;
      }
      if (vm.busy) return;
      vm.busy = true;
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
        $state.go('manager.departments.view', { departmentId: res._id });
      }

      function errorCallback(res) {
        vm.busy = false;
        $scope.handleShowToast(res.data.message, true);
      }
    }
    vm.handleDeleteDepartment = function () {
      $scope.handleShowConfirm({
        message: vm.department.name + 'を削除しますか？'
      }, function () {
        vm.department.$remove($state.go('manager.departments.list'));
      });
    };
    vm.handleSelectImageGallery = function () {
      $scope.selectedImage = '';
      var mDialog = ngDialog.open({
        template: 'modules/core/client/views/templates/images-gallery.dialog.template.html',
        scope: $scope,
        closeByDocument: false,
        showClose: false
      });
      mDialog.closePromise.then(function (res) {
        if (!res.value || res.value === '' || res.value === '$document') return;
        vm.avatarImageUrl = res.value;
        vm.department.avatar = res.value;
        delete $scope.selectedImage;
        vm.isGetAvatarFromFile = false;
      });
    };
    vm.handleCancelInput = function () {
      $scope.handleBackScreen('manager.departments.list');
    };
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
