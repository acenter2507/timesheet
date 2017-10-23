'use strict';

describe('Rests E2E Tests:', function () {
  describe('Test Rests page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/rests');
      expect(element.all(by.repeater('rest in rests')).count()).toEqual(0);
    });
  });
});
