(function () {
  'use strict';

  angular
    .module('core')
    .config(loadingBarConfig)
    .config(breadcrumbConfig)
    .config(toastConfig)
    .config(toolTipConfig)
    .config(calendarCf)
    .config(ngTagsInputConfig)
    .run(runConfig);

  loadingBarConfig.$inject = ['cfpLoadingBarProvider'];
  function loadingBarConfig(cfpLoadingBarProvider) {
    // Loading bar
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 1;
  }

  breadcrumbConfig.$inject = ['$breadcrumbProvider'];
  function breadcrumbConfig($breadcrumbProvider) {
    // Breadcrumb
    $breadcrumbProvider.setOptions({
      prefixStateName: 'home',
      includeAbstract: true,
      template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });
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

  toolTipConfig.$inject = ['$tooltipProvider'];
  function toolTipConfig($tooltipProvider) {
    var parser = new UAParser();
    var result = parser.getResult();
    var touch = result.device && (result.device.type === 'tablet' || result.device.type === 'mobile');
    if (touch) {
      var options = {
        trigger: 'dontTrigger'
      };
      $tooltipProvider.options(options);
    }
  }

  calendarCf.$inject = ['calendarConfig'];
  function calendarCf(calendarConfig) {
    calendarConfig.dateFormatter = 'moment';
  }

  ngTagsInputConfig.$inject = ['tagsInputConfigProvider'];
  function ngTagsInputConfig(tagsInputConfigProvider) {
    tagsInputConfigProvider.setDefaults('tagsInput', {
      placeholder: ''
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