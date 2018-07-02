// Payments service used to communicate Payments REST endpoints
(function () {
  'use strict';

  angular
    .module('payments')
    .factory('PaymentFactory', PaymentFactory);

  function PaymentFactory() {
    this.payment = {};
    this.addTransport = function (transport) {
      this.payment.transports.push(transport);
    };
    this.addTrip = function (trip) {
      this.payment.trips.push(trip);
    };
    this.addOther = function (other) {
      this.payment.others.push(other);
    };
    this.addVehicle = function (vehicle) {
      this.payment.vehicles.push(vehicle);
    };
    this.set = function (payment) {
      this.payment = payment;
    };
    this.update = function (payment) {
      _.extend(this.payment, payment);
    };
    this.delete = function () {
      delete this.payment;
    };
    return this;
  }
}());
