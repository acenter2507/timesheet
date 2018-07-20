'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Rooms Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user'],
    allows: [{
      resources: '/api/rooms',
      permissions: ['get']
    }, {
      resources: '/api/rooms/:roomId',
      permissions: ['get']
    }, {
      resources: '/api/bookings',
      permissions: ['get', 'post']
    }, {
      resources: '/api/bookings/:bookingId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Rooms Policy Allows
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

  if (req.room && req.user && req.room.user && req.room.user.id === req.user.id) {
    return next();
  }

  if (req.booking && req.user && req.booking.user && req.booking.user.id === req.user.id) {
    return next();
  }

  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err)
      return res.status(500).send('サーバーに権限を確認できません！');
    if (isAllowed)
      return next();
    return res.status(403).json({ message: '権限がありません！' });
  });
};
