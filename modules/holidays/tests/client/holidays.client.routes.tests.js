(function () {
  'use strict';

  describe('Holidays Route Tests', function () {
    // Initialize global variables
    var $scope,
      HolidaysService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _HolidaysService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      HolidaysService = _HolidaysService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('holidays');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/holidays');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          HolidaysController,
          mockHoliday;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('holidays.view');
          $templateCache.put('modules/holidays/client/views/view-holiday.client.view.html', '');

          // create mock Holiday
          mockHoliday = new HolidaysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Holiday Name'
          });

          // Initialize Controller
          HolidaysController = $controller('HolidaysController as vm', {
            $scope: $scope,
            holidayResolve: mockHoliday
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:holidayId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.holidayResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            holidayId: 1
          })).toEqual('/holidays/1');
        }));

        it('should attach an Holiday to the controller scope', function () {
          expect($scope.vm.holiday._id).toBe(mockHoliday._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/holidays/client/views/view-holiday.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          HolidaysController,
          mockHoliday;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('holidays.create');
          $templateCache.put('modules/holidays/client/views/form-holiday.client.view.html', '');

          // create mock Holiday
          mockHoliday = new HolidaysService();

          // Initialize Controller
          HolidaysController = $controller('HolidaysController as vm', {
            $scope: $scope,
            holidayResolve: mockHoliday
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.holidayResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/holidays/create');
        }));

        it('should attach an Holiday to the controller scope', function () {
          expect($scope.vm.holiday._id).toBe(mockHoliday._id);
          expect($scope.vm.holiday._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/holidays/client/views/form-holiday.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          HolidaysController,
          mockHoliday;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('holidays.edit');
          $templateCache.put('modules/holidays/client/views/form-holiday.client.view.html', '');

          // create mock Holiday
          mockHoliday = new HolidaysService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Holiday Name'
          });

          // Initialize Controller
          HolidaysController = $controller('HolidaysController as vm', {
            $scope: $scope,
            holidayResolve: mockHoliday
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:holidayId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.holidayResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            holidayId: 1
          })).toEqual('/holidays/1/edit');
        }));

        it('should attach an Holiday to the controller scope', function () {
          expect($scope.vm.holiday._id).toBe(mockHoliday._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/holidays/client/views/form-holiday.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
