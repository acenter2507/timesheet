'use strict';

exports.invokeRolesPolicies = function () {
  return;
};

exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : [];
  if (roles.indexOf('admin') >= 0)
    return next();

  return res.status(403).json({ message: 'アクセス権限がありません！' });
};
