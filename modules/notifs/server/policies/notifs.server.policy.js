'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Notifs Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/notifs',
      permissions: '*'
    }, {
      resources: '/api/notifs/:notifId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/notifs',
      permissions: ['get', 'post']
    }, {
      resources: '/api/notifs/:notifId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/notifs',
      permissions: ['get']
    }, {
      resources: '/api/notifs/:notifId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Notifs Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [''];

  if (roles.length === 0)
    return res.status(403).json({ message: 'アクセス権限がありません！' });

  // If an Notif is being processed and the current user created it then allow any manipulation
  if (req.notif && req.user && req.notif.user && req.notif.user.id === req.user.id) {
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
