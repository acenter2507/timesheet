'use strict';

describe('Chats E2E Tests:', function () {
  describe('Test Chats page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/chats');
      expect(element.all(by.repeater('chat in chats')).count()).toEqual(0);
    });
  });
});
