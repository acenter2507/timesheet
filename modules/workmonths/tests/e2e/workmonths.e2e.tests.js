'use strict';

describe('Workmonths E2E Tests:', function () {
  describe('Test Workmonths page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/workmonths');
      expect(element.all(by.repeater('workmonth in workmonths')).count()).toEqual(0);
    });
  });
});
