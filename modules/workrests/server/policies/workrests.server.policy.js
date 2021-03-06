'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Workrests Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user'],
    allows: [{
      resources: '/api/workrests',
      permissions: ['get', 'post']
    }, {
      resources: '/api/workrests/list',
      permissions: ['post']
    }]
  }, {
    roles: ['manager'],
    allows: [{
      resources: '/api/workrests',
      permissions: ['get', 'post']
    }, {
      resources: '/api/workrests/:workrestId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/workrests/:workrestId/approve',
      permissions: ['post']
    }, {
      resources: '/api/workrests/:workrestId/reject',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Workrests Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];

  if (roles.length === 0)
    return res.status(403).json({ message: 'アクセス権限がありません！' });
  if (roles.indexOf('admin') >= 0)
    return next();
  if (roles.indexOf('accountant') >= 0)
    return next();
  if (req.workrest && req.user && req.workrest.user && req.workrest.user.id === req.user.id) {
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
        return res.status(403).json({
          message: 'アクセス権限がありません！'
        });
      }
    }
  });
};
