'use strict';

exports.invokeRolesPolicies = function () {
  return;
};
/**
 * Check If Admin Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  if (!req.user) return res.status(403).send(new Error('アクセス権限がありません！'));
  var roles = (req.user) ? req.user.roles : [];
  if (roles.length <= 1) return res.status(403).send(new Error('アクセス権限がありません！'));
  return next();
};
