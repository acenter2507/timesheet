(function () {
  'use strict';

  describe('Rooms Route Tests', function () {
    // Initialize global variables
    var $scope,
      RoomsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _RoomsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      RoomsService = _RoomsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('rooms');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/rooms');
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
          RoomsController,
          mockRoom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('rooms.view');
          $templateCache.put('modules/rooms/client/views/view-room.client.view.html', '');

          // create mock Room
          mockRoom = new RoomsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Room Name'
          });

          // Initialize Controller
          RoomsController = $controller('RoomsController as vm', {
            $scope: $scope,
            roomResolve: mockRoom
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:roomId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.roomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            roomId: 1
          })).toEqual('/rooms/1');
        }));

        it('should attach an Room to the controller scope', function () {
          expect($scope.vm.room._id).toBe(mockRoom._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/rooms/client/views/view-room.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          RoomsController,
          mockRoom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('rooms.create');
          $templateCache.put('modules/rooms/client/views/form-room.client.view.html', '');

          // create mock Room
          mockRoom = new RoomsService();

          // Initialize Controller
          RoomsController = $controller('RoomsController as vm', {
            $scope: $scope,
            roomResolve: mockRoom
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.roomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/rooms/create');
        }));

        it('should attach an Room to the controller scope', function () {
          expect($scope.vm.room._id).toBe(mockRoom._id);
          expect($scope.vm.room._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/rooms/client/views/form-room.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          RoomsController,
          mockRoom;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('rooms.edit');
          $templateCache.put('modules/rooms/client/views/form-room.client.view.html', '');

          // create mock Room
          mockRoom = new RoomsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Room Name'
          });

          // Initialize Controller
          RoomsController = $controller('RoomsController as vm', {
            $scope: $scope,
            roomResolve: mockRoom
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:roomId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.roomResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            roomId: 1
          })).toEqual('/rooms/1/edit');
        }));

        it('should attach an Room to the controller scope', function () {
          expect($scope.vm.room._id).toBe(mockRoom._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/rooms/client/views/form-room.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
