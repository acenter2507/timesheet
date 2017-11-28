(function () {
  'use strict';

  describe('Months List Controller Tests', function () {
    // Initialize global variables
    var MonthsListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      MonthsService,
      mockMonth;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _MonthsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      MonthsService = _MonthsService_;

      // create mock article
      mockMonth = new MonthsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Month Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Months List controller.
      MonthsListController = $controller('MonthsListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockMonthList;

      beforeEach(function () {
        mockMonthList = [mockMonth, mockMonth];
      });

      it('should send a GET request and return all Months', inject(function (MonthsService) {
        // Set POST response
        $httpBackend.expectGET('api/months').respond(mockMonthList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.months.length).toEqual(2);
        expect($scope.vm.months[0]).toEqual(mockMonth);
        expect($scope.vm.months[1]).toEqual(mockMonth);

      }));
    });
  });
}());
