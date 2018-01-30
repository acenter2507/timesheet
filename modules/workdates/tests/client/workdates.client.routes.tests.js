(function () {
  'use strict';

  describe('Workdates Route Tests', function () {
    // Initialize global variables
    var $scope,
      WorkdatesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _WorkdatesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      WorkdatesService = _WorkdatesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('workdates');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/workdates');
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
          WorkdatesController,
          mockWorkdate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('workdates.view');
          $templateCache.put('modules/workdates/client/views/view-workdate.client.view.html', '');

          // create mock Workdate
          mockWorkdate = new WorkdatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Workdate Name'
          });

          // Initialize Controller
          WorkdatesController = $controller('WorkdatesController as vm', {
            $scope: $scope,
            workdateResolve: mockWorkdate
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:workdateId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.workdateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            workdateId: 1
          })).toEqual('/workdates/1');
        }));

        it('should attach an Workdate to the controller scope', function () {
          expect($scope.vm.workdate._id).toBe(mockWorkdate._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/workdates/client/views/view-workdate.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          WorkdatesController,
          mockWorkdate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('workdates.create');
          $templateCache.put('modules/workdates/client/views/form-workdate.client.view.html', '');

          // create mock Workdate
          mockWorkdate = new WorkdatesService();

          // Initialize Controller
          WorkdatesController = $controller('WorkdatesController as vm', {
            $scope: $scope,
            workdateResolve: mockWorkdate
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.workdateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/workdates/create');
        }));

        it('should attach an Workdate to the controller scope', function () {
          expect($scope.vm.workdate._id).toBe(mockWorkdate._id);
          expect($scope.vm.workdate._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/workdates/client/views/form-workdate.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          WorkdatesController,
          mockWorkdate;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('workdates.edit');
          $templateCache.put('modules/workdates/client/views/form-workdate.client.view.html', '');

          // create mock Workdate
          mockWorkdate = new WorkdatesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Workdate Name'
          });

          // Initialize Controller
          WorkdatesController = $controller('WorkdatesController as vm', {
            $scope: $scope,
            workdateResolve: mockWorkdate
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:workdateId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.workdateResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            workdateId: 1
          })).toEqual('/workdates/1/edit');
        }));

        it('should attach an Workdate to the controller scope', function () {
          expect($scope.vm.workdate._id).toBe(mockWorkdate._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/workdates/client/views/form-workdate.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
