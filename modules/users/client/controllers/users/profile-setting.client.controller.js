'use strict';

angular
  .module('users')
  .controller('ProfileSettingController', ProfileSettingController);

ProfileSettingController.$inject = ['$scope', '$state', 'UserApi', 'Authentication', 'FileUploader', '$window', '$timeout'];

function ProfileSettingController($scope, $state, UserApi, Authentication, FileUploader, $window, $timeout) {

  $scope.password_busy = false;
  $scope.info_busy = false;

  onCreate();
  function onCreate() {
    prepareUserInfo();
    prepareUpload();
  }

  function prepareUserInfo() {
    $scope.userInfo = _.pick($scope.user, '_id', 'private');
    $scope.imageURL = $scope.user.profileImageURL;
    if ($scope.userInfo.private.birthdate) {
      $scope.new_birthdate = moment($scope.userInfo.private.birthdate).format('YYYY/MM/DD');
    }
  }
  function prepareUpload() {
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    $scope.uploader.onAfterAddingAll = function (addedFileItems) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // $scope.user = Authentication.user = response;
      $scope.cancelUpload();
    };
    $scope.uploader.onErrorItem = function (fileItem, res, status, headers) {
      $scope.cancelUpload();
      $scope.handleShowToast(res.message, true);
    };
  }


  $scope.handleChangePassword = function (isValid) {
    if (!isValid) {
      $scope.$broadcast('show-errors-check-validity', 'passwordForm');
      return false;
    }
    if ($scope.password_busy) return;
    $scope.password_busy = true;
    UserApi.password($scope.passwordDetails)
      .success(function (response) {
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        delete $scope.passwordDetails;
        $scope.password_busy = false;
        $scope.handleShowToast('パスワードを変更しました。', false);
      }).error(function (err) {
        $scope.password_busy = false;
        $scope.handleShowToast(err.message, true);
      });
  };
  $scope.handleSaveInfo = function () {
    if ($scope.info_busy) return;
    $scope.info_busy = true;

    if ($scope.new_birthdate) {
      $scope.userInfo.private.birthdate = $scope.new_birthdate;
    }

    UserApi.profile($scope.userInfo)
      .success(function (res) {
        $scope.handleShowToast('個人情報を変更しました。', false);
        _.extend(Authentication.user.private, res.private);
        $scope.info_busy = false;
      }).error(function (err) {
        prepareUserInfo();
        $scope.handleShowToast(err.message, true);
        $scope.info_busy = false;
      });
  };
  $scope.handleUploadProfilePicture = function () {
    $scope.uploader.uploadAll();
  };
  $scope.cancelUpload = function () {
    $scope.uploader.clearQueue();
    $scope.imageURL = $scope.user.profileImageURL;
  };
}
