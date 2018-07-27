'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Departments Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['user'],
    allows: [{
      resources: '/api/departments',
      permissions: ['get']
    }, {
      resources: '/api/departments/:departmentId',
      permissions: ['get']
    }, {
      resources: '/api/departments/autocomplete',
      permissions: ['post']
    }]
  }, {
    roles: ['manager'],
    allows: [{
      resources: '/api/departments/manager',
      permissions: '*'
    }, {
      resources: '/api/departments/manager/:departmentId',
      permissions: '*'
    }, {
      resources: '/api/departments/manager/:departmentId/user',
      permissions: ['post', 'put']
    }, {
      resources: '/api/departments/manager/avatar',
      permissions: ['post']
    }]
  }]);
};

/**
 * Check If Departments Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.length === 0)
    return res.status(403).json({ message: 'アクセス権限がありません！' });

  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err)
      return res.status(500).send('サーバーでエラーが発生しました！');
    if (!isAllowed)
      return res.status(422).send('サーバーに権限を確認できません！');
    return next();
  });
};
