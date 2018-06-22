'use strict';

describe('Transports E2E Tests:', function () {
  describe('Test Transports page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/transports');
      expect(element.all(by.repeater('transport in transports')).count()).toEqual(0);
    });
  });
});
