'use strict';

/**
 * Module dependencies
 */
var paymentsPolicy = require('../policies/payments.server.policy'),
  payments = require('../controllers/payments.server.controller');

module.exports = function (app) {

  // Get all month in year of 1 user
  app.route('/api/payments/paymentsByYear').post(payments.paymentsByYear);
  app.route('/api/payments/receipts').all(paymentsPolicy.isAllowed).post(payments.receipts);
  app.route('/api/payments/reviews').all(paymentsPolicy.isAllowed).post(payments.reviews);
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
  app.route('/api/payments/:paymentId/approve').all(paymentsPolicy.isAllowed).post(payments.approve);
  app.route('/api/payments/:paymentId/reject').all(paymentsPolicy.isAllowed).post(payments.reject);

  // Finish by binding the Payment middleware
  app.param('paymentId', payments.paymentByID);
};
