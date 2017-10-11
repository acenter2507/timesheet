'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'AdminUserService',
  function ($scope, $filter, AdminUserService) {
    var vm = this;

    vm.manager = { page: 1 };
    vm.member = { page: 1 };
    vm.admin = { page: 1 };
    onCreate();

    function onCreate() {
      prepareManagerUsers();
      prepareMemberUsers();
      prepareAdminUsers();
    }

    function prepareManagerUsers() {
      vm.manager.page = 1;
      
    }
    function prepareMemberUsers() {
      
    }
    function prepareAdminUsers() {
      
    }

    AdminUserService.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);
