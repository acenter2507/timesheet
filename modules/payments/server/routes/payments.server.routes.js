'use strict';

/**
 * Module dependencies
 */
var paymentsPolicy = require('../policies/payments.server.policy'),
  payments = require('../controllers/payments.server.controller'),
  payments_admin = require('../controllers/payments-admin.server.controller');

module.exports = function (app) {

  // Get all month in year of 1 user
  app.route('/api/payments/list').all(paymentsPolicy.isAllowed).post(payments.list);
  app.route('/api/payments/receipts').all(paymentsPolicy.isAllowed).post(payments.receipts);

  // Payments Routes
  app.route('/api/payments').all(paymentsPolicy.isAllowed)
    .get(payments.list)
    .post(payments.create);

  app.route('/api/payments/:paymentId').all(paymentsPolicy.isAllowed)
    .get(payments.read)
    .put(payments.update)
    .delete(payments.delete);

  app.route('/api/payments/:paymentId/request').all(paymentsPolicy.isAllowed).post(payments.request);
  app.route('/api/payments/:paymentId/cancel').all(paymentsPolicy.isAllowed).post(payments.cancel);
  app.route('/api/payments/:paymentId/requestDelete').all(paymentsPolicy.isAllowed).post(payments.requestDelete);
  app.route('/api/payments/:paymentId/deleteReceipt').all(paymentsPolicy.isAllowed).post(payments.deleteReceipt);

  // ADMIN
  app.route('/api/payments/admin/reviews').all(paymentsPolicy.isAllowed).post(payments_admin.reviews);
  app.route('/api/payments/admin/:paymentId/approve').all(paymentsPolicy.isAllowed).post(payments_admin.approve);
  app.route('/api/payments/admin/:paymentId/reject').all(paymentsPolicy.isAllowed).post(payments_admin.reject);

  // Finish by binding the Payment middleware
  app.param('paymentId', payments.paymentByID);
};
