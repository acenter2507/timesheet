'use strict';

describe('Workrests E2E Tests:', function () {
  describe('Test Workrests page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/workrests');
      expect(element.all(by.repeater('workrest in workrests')).count()).toEqual(0);
    });
  });
});
