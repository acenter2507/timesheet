(function () {
  'use strict';

  describe('Transports Route Tests', function () {
    // Initialize global variables
    var $scope,
      TransportsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _TransportsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      TransportsService = _TransportsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('transports');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/transports');
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
          TransportsController,
          mockTransport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('transports.view');
          $templateCache.put('modules/transports/client/views/view-transport.client.view.html', '');

          // create mock Transport
          mockTransport = new TransportsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Transport Name'
          });

          // Initialize Controller
          TransportsController = $controller('TransportsController as vm', {
            $scope: $scope,
            transportResolve: mockTransport
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:transportId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.transportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            transportId: 1
          })).toEqual('/transports/1');
        }));

        it('should attach an Transport to the controller scope', function () {
          expect($scope.vm.transport._id).toBe(mockTransport._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/transports/client/views/view-transport.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          TransportsController,
          mockTransport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('transports.create');
          $templateCache.put('modules/transports/client/views/form-transport.client.view.html', '');

          // create mock Transport
          mockTransport = new TransportsService();

          // Initialize Controller
          TransportsController = $controller('TransportsController as vm', {
            $scope: $scope,
            transportResolve: mockTransport
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.transportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/transports/create');
        }));

        it('should attach an Transport to the controller scope', function () {
          expect($scope.vm.transport._id).toBe(mockTransport._id);
          expect($scope.vm.transport._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/transports/client/views/form-transport.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          TransportsController,
          mockTransport;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('transports.edit');
          $templateCache.put('modules/transports/client/views/form-transport.client.view.html', '');

          // create mock Transport
          mockTransport = new TransportsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Transport Name'
          });

          // Initialize Controller
          TransportsController = $controller('TransportsController as vm', {
            $scope: $scope,
            transportResolve: mockTransport
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:transportId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.transportResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            transportId: 1
          })).toEqual('/transports/1/edit');
        }));

        it('should attach an Transport to the controller scope', function () {
          expect($scope.vm.transport._id).toBe(mockTransport._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/transports/client/views/form-transport.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
