'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Payments Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user'],
    allows: [{
      resources: '/api/payments',
      permissions: ['get', 'post']
    }, {
      resources: '/api/payments/receipts',
      permissions: ['post']
    }, {
      resources: '/api/payments/list',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Payments Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.length === 0) {
    return res.status(403).json({ message: 'アクセス権限がありません！' });
  }
  if (roles.indexOf('admin') >= 0)
    return next();
  if (roles.indexOf('accountant') >= 0)
    return next();
  if (req.payment && req.user && req.payment.user && req.payment.user.id === req.user.id) {
    return next();
  }
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('サーバーに権限を確認できません！');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({ message: '権限がありません！' });
      }
    }
  });
};
