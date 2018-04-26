'use strict';

describe('Messages E2E Tests:', function () {
  describe('Test Messages page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/messages');
      expect(element.all(by.repeater('message in messages')).count()).toEqual(0);
    });
  });
});
