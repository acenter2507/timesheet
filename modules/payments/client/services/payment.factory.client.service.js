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
    this.setTransport = function (transport) {
      this.transport = transport;
    };
    this.deleteTransport = function () {
      delete this.transport;
    };
    this.addTrip = function (trip) {
      this.payment.trips.push(trip);
    };
    this.setTrip = function (trip) {
      this.trip = trip;
    };
    this.deleteTrip = function () {
      delete this.trip;
    };
    this.addVehicle = function (vehicle) {
      this.payment.vehicles.push(vehicle);
    };
    this.setVehicle = function (vehicle) {
      this.vehicle = vehicle;
    };
    this.deleteVehicle = function () {
      delete this.vehicle;
    };
    this.addOther = function (other) {
      this.payment.others.push(other);
    };
    this.setOther = function (other) {
      this.other = other;
    };
    this.deleteOther = function () {
      delete this.other;
    };
    this.addMeeting = function (meeting) {
      this.payment.meetings.push(meeting);
    };
    this.setMeeting = function (meeting) {
      this.meeting = meeting;
    };
    this.deleteMeeting = function () {
      delete this.meeting;
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
