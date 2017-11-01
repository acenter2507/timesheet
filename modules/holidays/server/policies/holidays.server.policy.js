'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Holidays Permissions
 */
exports.invokeRolesPolicies = function () { };

/**
 * Check If Holidays Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.indexOf('admin') >= 0 || roles.indexOf('accountant') >= 0) return next();
  return res.status(403).json({ message: '権限がありません。' });
};
