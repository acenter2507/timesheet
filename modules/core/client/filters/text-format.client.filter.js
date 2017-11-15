(function () {
  'use strict';

  angular
    .module('core')
    .filter('nl2br', nl2br);

  function nl2br($sce) {
    return function (msg, is_xhtml) {
      var _is_xhtml = is_xhtml || true;
      var breakTag = _is_xhtml ? '<br />' : '<br>';
      var _msg = (msg + '').replace(
        /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
        '$1' + breakTag + '$2'
      );
      return $sce.trustAsHtml(_msg);
    };
  }
}());
