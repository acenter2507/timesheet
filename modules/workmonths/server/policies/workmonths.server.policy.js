'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Workmonths Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user'],
    allows: [{
      resources: '/api/workmonths',
      permissions: ['get', 'post']
    }, {
      resources: '/api/workmonths/:workmonthId',
      permissions: ['get']
    }, {
      resources: '/api/workmonths/list',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Workmonths Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];

  if (roles.length === 0)
    return res.status(403).json({ message: 'アクセス権限がありません！' });

  if (roles.indexOf('admin') >= 0)
    return next();
  if (roles.indexOf('accountant') >= 0)
    return next();

  // If an Workmonth is being processed and the current user created it then allow any manipulation
  if (req.workmonth && req.user && req.workmonth.user && req.workmonth.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('サーバーに権限を確認できません！');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({ message: 'アクセス権限がありません！' });
      }
    }
  });
};
