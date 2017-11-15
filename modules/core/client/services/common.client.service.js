'use strict';

angular.module('core').factory('CommonService', CommonService);

CommonService.$inject = [];
function CommonService() {
  this.isAdmin = roles => {
    return _.contains(roles, 'admin');
  };
  this.isManager = roles => {
    return _.contains(roles, 'manager');
  };
  this.isAccountant = roles => {
    return _.contains(roles, 'accountant') && roles.length === 2;
  };
  this.isMember = roles => {
    return roles.length === 1;
  };
  return this;
}
