'use strict';

describe('Months E2E Tests:', function () {
  describe('Test Months page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/months');
      expect(element.all(by.repeater('month in months')).count()).toEqual(0);
    });
  });
});
