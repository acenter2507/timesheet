'use strict';

describe('Rooms E2E Tests:', function () {
  describe('Test Rooms page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/rooms');
      expect(element.all(by.repeater('room in rooms')).count()).toEqual(0);
    });
  });
});
