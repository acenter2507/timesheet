(function () {
  'use strict';

  describe('Departments Route Tests', function () {
    // Initialize global variables
    var $scope,
      DepartmentsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _DepartmentsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      DepartmentsService = _DepartmentsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('departments');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/departments');
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
          DepartmentsController,
          mockDepartment;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('departments.view');
          $templateCache.put('modules/departments/client/views/view-department.client.view.html', '');

          // create mock Department
          mockDepartment = new DepartmentsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Department Name'
          });

          // Initialize Controller
          DepartmentsController = $controller('DepartmentsController as vm', {
            $scope: $scope,
            departmentResolve: mockDepartment
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:departmentId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.departmentResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            departmentId: 1
          })).toEqual('/departments/1');
        }));

        it('should attach an Department to the controller scope', function () {
          expect($scope.vm.department._id).toBe(mockDepartment._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/departments/client/views/view-department.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          DepartmentsController,
          mockDepartment;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('departments.create');
          $templateCache.put('modules/departments/client/views/form-department.client.view.html', '');

          // create mock Department
          mockDepartment = new DepartmentsService();

          // Initialize Controller
          DepartmentsController = $controller('DepartmentsController as vm', {
            $scope: $scope,
            departmentResolve: mockDepartment
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.departmentResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/departments/create');
        }));

        it('should attach an Department to the controller scope', function () {
          expect($scope.vm.department._id).toBe(mockDepartment._id);
          expect($scope.vm.department._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/departments/client/views/form-department.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          DepartmentsController,
          mockDepartment;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('departments.edit');
          $templateCache.put('modules/departments/client/views/form-department.client.view.html', '');

          // create mock Department
          mockDepartment = new DepartmentsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Department Name'
          });

          // Initialize Controller
          DepartmentsController = $controller('DepartmentsController as vm', {
            $scope: $scope,
            departmentResolve: mockDepartment
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:departmentId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.departmentResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            departmentId: 1
          })).toEqual('/departments/1/edit');
        }));

        it('should attach an Department to the controller scope', function () {
          expect($scope.vm.department._id).toBe(mockDepartment._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/departments/client/views/form-department.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
