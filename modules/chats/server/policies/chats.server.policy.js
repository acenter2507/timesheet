'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Chats Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([]);
};

/**
 * Check If Chats Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.length > 0) return next();
  return res.status(403).json({
    message: 'アクセスの権限がありません！'
  });
};
