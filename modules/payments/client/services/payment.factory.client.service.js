// Payments service used to communicate Payments REST endpoints
(function () {
  'use strict';

  angular
    .module('payments')
    .factory('PaymentFactory', PaymentFactory);

  function PaymentFactory() {
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
    this.addMeeting = function (meeting) {
      this.payment.meetings.push(meeting);
    };
    this.set = function (payment) {
      this.payment = payment;
    };
    this.setTransport = function (transport) {
      this.transport = transport;
    };
    this.setTrip = function (trip) {
      this.trip = trip;
    };
    this.setOther = function (other) {
      this.other = other;
    };
    this.setVehicle = function (vehicle) {
      this.vehicle = vehicle;
    };
    this.setMeeting = function (meeting) {
      this.meeting = meeting;
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
