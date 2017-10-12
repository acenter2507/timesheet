'use strict';

angular.module('core').factory('CommonService', CommonService);

CommonService.$inject = [];
function CommonService() {
  this.checkUserIsAdmin = roles => {
    return _.contains(roles, 'admin');
  };
  this.checkUserIsManager = roles => {
    return _.contains(roles, 'manager');
  };
  this.checkUserIsAccountant = roles => {
    return _.contains(roles, 'accountant') && roles.length === 2;
  };
  this.checkUserIsMember = roles => {
    return roles.length === 1;
  };
  return this;
}
