(function () {
  'use strict';

  describe('Chats Route Tests', function () {
    // Initialize global variables
    var $scope,
      ChatsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ChatsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ChatsService = _ChatsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('chats');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/chats');
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
          ChatsController,
          mockChat;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('chats.view');
          $templateCache.put('modules/chats/client/views/view-chat.client.view.html', '');

          // create mock Chat
          mockChat = new ChatsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Chat Name'
          });

          // Initialize Controller
          ChatsController = $controller('ChatsController as vm', {
            $scope: $scope,
            chatResolve: mockChat
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:chatId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.chatResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            chatId: 1
          })).toEqual('/chats/1');
        }));

        it('should attach an Chat to the controller scope', function () {
          expect($scope.vm.chat._id).toBe(mockChat._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/chats/client/views/view-chat.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ChatsController,
          mockChat;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('chats.create');
          $templateCache.put('modules/chats/client/views/form-chat.client.view.html', '');

          // create mock Chat
          mockChat = new ChatsService();

          // Initialize Controller
          ChatsController = $controller('ChatsController as vm', {
            $scope: $scope,
            chatResolve: mockChat
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.chatResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/chats/create');
        }));

        it('should attach an Chat to the controller scope', function () {
          expect($scope.vm.chat._id).toBe(mockChat._id);
          expect($scope.vm.chat._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/chats/client/views/form-chat.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ChatsController,
          mockChat;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('chats.edit');
          $templateCache.put('modules/chats/client/views/form-chat.client.view.html', '');

          // create mock Chat
          mockChat = new ChatsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Chat Name'
          });

          // Initialize Controller
          ChatsController = $controller('ChatsController as vm', {
            $scope: $scope,
            chatResolve: mockChat
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:chatId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.chatResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            chatId: 1
          })).toEqual('/chats/1/edit');
        }));

        it('should attach an Chat to the controller scope', function () {
          expect($scope.vm.chat._id).toBe(mockChat._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/chats/client/views/form-chat.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
