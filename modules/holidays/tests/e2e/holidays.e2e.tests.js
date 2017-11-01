'use strict';

describe('Holidays E2E Tests:', function () {
  describe('Test Holidays page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/holidays');
      expect(element.all(by.repeater('holiday in holidays')).count()).toEqual(0);
    });
  });
});
