'use strict';

describe('Departments E2E Tests:', function () {
  describe('Test Departments page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/departments');
      expect(element.all(by.repeater('department in departments')).count()).toEqual(0);
    });
  });
});
