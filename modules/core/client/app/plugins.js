(function () {
  'use strict';

  angular
    .module('core')
    .config(loadingBarConfig)
    .config(toastConfig)
    .run(runConfig);

  loadingBarConfig.$inject = ['cfpLoadingBarProvider'];

  function loadingBarConfig(cfpLoadingBarProvider) {
    // Loading bar
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 1;
  }

  toastConfig.$inject = ['toastrConfig'];
  function toastConfig(toastrConfig) {
    angular.extend(toastrConfig, {
      allowHtml: false,
      autoDismiss: true,
      closeButton: true,
      // containerId: 'toast-container',
      maxOpened: 5,
      newestOnTop: false,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }

  function runConfig(amMoment) {
    moment.tz.add([
      'Asia/Tokyo|JST JDT|-90 -a0|010101010|-QJH0 QL0 1lB0 13X0 1zB0 NX0 1zB0 NX0|38e6'
    ]);
    moment.tz.setDefault('Asia/Tokyo');
    moment.locale('ja');
    amMoment.changeLocale('ja');
  }
}());