'use strict';
var acl = require('acl');
acl = new acl(new acl.memoryBackend());

exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/users',
      permissions: ['get', 'post']
    }, {
      resources: '/api/users/list',
      permissions: ['post']
    }, {
      resources: '/api/users/:userId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/users/:userId/resetpass',
      permissions: ['post']
    }]
  }, {
    roles: ['accountant'],
    allows: [{
      resources: '/api/users/accountant/list',
      permissions: ['post']
    }, {
      resources: '/api/users/accountant/:userId',
      permissions: ['get', 'put']
    }, {
      resources: '/api/users/accountant/:userId/department',
      permissions: ['post']
    }]
  }]);
};

exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];

  if (roles.length === 0)
    return res.status(403).json({ message: 'アクセス権限がありません！' });

  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err)
      return res.status(500).send('サーバーでエラーが発生しました！');
    if (!isAllowed)
      return res.status(403).json({ message: 'アクセス権限がありません！' });
    return next();
  });
};
