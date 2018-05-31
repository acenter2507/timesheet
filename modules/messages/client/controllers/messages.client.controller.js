(function () {
  'use strict';

  // Messages controller
  angular
    .module('messages')
    .controller('MessagesController', MessagesController);

  MessagesController.$inject = ['$scope', '$state', 'messageResolve', 'AdminUserApi', 'CommonService', 'DepartmentsApi', '$q'];

  function MessagesController($scope, $state, message, AdminUserApi, CommonService, DepartmentsApi, $q) {
    var vm = this;

    vm.message = message;
    vm.message.destination = 1;
    vm.form = {};

    vm.handleDestinationChanged = function () {
      // console.log(vm.message.destination);
      vm.message.users = [];
      vm.message.deparments = [];
    };
    vm.handleSearchUsers = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      AdminUserApi.searchUsers({ key: $query, department: false })
        .success(users => {
          deferred.resolve(users);
        });

      return deferred.promise;
    };
    vm.handleSearchDepartments = function ($query) {
      if (CommonService.isStringEmpty($query)) {
        return [];
      }

      var deferred = $q.defer();
      DepartmentsApi.search({ key: $query })
        .success(departments => {
          deferred.resolve(departments);
        });

      return deferred.promise;
    };
    vm.handleSendMessage = function () {
      if (CommonService.isStringEmpty(vm.message.content)) {
        $scope.handleShowToast('お知らせの内容を入力してください！');
        return;
      }
      if (vm.message.destination === 2 && vm.message.deparments.length === 0) {
        $scope.handleShowToast('宛先を追加してください！');
        return;
      }
      if (vm.message.destination === 3 && vm.message.users.length === 0) {
        $scope.handleShowToast('宛先を追加してください！');
        return;
      }

      if (vm.message._id) {
        vm.message.$update(successCallback, errorCallback);
      } else {
        vm.message.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $scope.handleShowToast('お知らせを送信しました！', false);
      }

      function errorCallback(res) {
        $scope.handleShowToast('お知らせを送信できません！', false);
      }


    };
    vm.handleCancelMessage = function () {
      $scope.handleShowConfirm({
        message: 'お知らせの送信をキャンセルしますか？'
      }, () => {
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      });
    };
  }
}());
