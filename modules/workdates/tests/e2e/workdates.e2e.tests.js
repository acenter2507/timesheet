'use strict';

describe('Workdates E2E Tests:', function () {
  describe('Test Workdates page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/workdates');
      expect(element.all(by.repeater('workdate in workdates')).count()).toEqual(0);
    });
  });
});
