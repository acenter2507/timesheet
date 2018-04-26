(function () {
  'use strict';

  describe('Messages Route Tests', function () {
    // Initialize global variables
    var $scope,
      MessagesService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _MessagesService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      MessagesService = _MessagesService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('messages');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/messages');
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
          MessagesController,
          mockMessage;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('messages.view');
          $templateCache.put('modules/messages/client/views/view-message.client.view.html', '');

          // create mock Message
          mockMessage = new MessagesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Message Name'
          });

          // Initialize Controller
          MessagesController = $controller('MessagesController as vm', {
            $scope: $scope,
            messageResolve: mockMessage
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:messageId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.messageResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            messageId: 1
          })).toEqual('/messages/1');
        }));

        it('should attach an Message to the controller scope', function () {
          expect($scope.vm.message._id).toBe(mockMessage._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/messages/client/views/view-message.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          MessagesController,
          mockMessage;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('messages.create');
          $templateCache.put('modules/messages/client/views/form-message.client.view.html', '');

          // create mock Message
          mockMessage = new MessagesService();

          // Initialize Controller
          MessagesController = $controller('MessagesController as vm', {
            $scope: $scope,
            messageResolve: mockMessage
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.messageResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/messages/create');
        }));

        it('should attach an Message to the controller scope', function () {
          expect($scope.vm.message._id).toBe(mockMessage._id);
          expect($scope.vm.message._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/messages/client/views/form-message.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          MessagesController,
          mockMessage;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('messages.edit');
          $templateCache.put('modules/messages/client/views/form-message.client.view.html', '');

          // create mock Message
          mockMessage = new MessagesService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Message Name'
          });

          // Initialize Controller
          MessagesController = $controller('MessagesController as vm', {
            $scope: $scope,
            messageResolve: mockMessage
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:messageId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.messageResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            messageId: 1
          })).toEqual('/messages/1/edit');
        }));

        it('should attach an Message to the controller scope', function () {
          expect($scope.vm.message._id).toBe(mockMessage._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/messages/client/views/form-message.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
