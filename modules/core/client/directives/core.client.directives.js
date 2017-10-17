'use strict';
angular
  .module('core')
  .directive('a', preventClickDirective)
  .directive('a', asideMenuToggleDirective)
  .directive('body', asideMenuHideDirective)
  .directive('focusMe', focusMeDirective)
  .directive('a', blockExpandDirective)
  .directive('a', selectInListDirective)
  .directive('button', toggleLeftSideDirective);

// Hủy tác dụng của link rỗng
function preventClickDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    if (attrs.href === '#') {
      element.on('click', function (event) {
        event.preventDefault();
      });
    }
  }
}
// Thiết lập event toggle menu phải
function asideMenuToggleDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function (e) {
      if (element.hasClass('aside-menu-toggler')) {
        angular.element('body').toggleClass('aside-menu-show');
      }
    });
  }
}
// Thiết lập sự kiện click bên ngoài menu
function asideMenuHideDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    angular.element(document).bind('mouseup touchend', function (e) {
      var container = angular.element('#aside-menu');
      var btn = angular.element('#aside-menu-toggler');
      if (!container.is(e.target) && container.has(e.target).length === 0 && !btn.is(e.target) && btn.has(e.target).length === 0) {
        if (element.hasClass('aside-menu-show')) {
          element.removeClass('aside-menu-show');
        }
      }
    });
  }
}
// Focus me
function focusMeDirective($timeout) {
  return {
    scope: { trigger: '@focusMe' },
    link: function (scope, element) {
      scope.$watch('trigger', function (value) {
        if (value === 'true') {
          $timeout(function () {
            element[0].focus();
          });
        }
      });
    }
  };
}
//Card Collapse
function blockExpandDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function () {
      if (element.hasClass('expand-toggle')) {
        element.find('i').toggleClass('fa-rotate-180');
        element.parent().parent().parent().toggleClass('expand');
      }
    });
  }
}
// Hủy tác dụng của link rỗng
function selectInListDirective() {
  var directive = {
    restrict: 'E',
    scope: { model: '=' },
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function (event) {
      if (element.hasClass('list-sellect-item')) {
        var div = element.parent().parent();
        var listItems = div.find('.list-sellect-item');
        for (var i = 0; i < listItems.length; i++) {
          var item = listItems[i];
          angular.element(item).removeClass('selected');
        }
        element.addClass('selected');
        scope.model = attrs.image;
        scope.$apply();
      }
    });
  }
}
// Thiết lập event toggle menu trái
function toggleLeftSideDirective() {
  var directive = {
    restrict: 'E',
    link: link
  };
  return directive;

  function link(scope, element, attrs) {
    element.on('click', function (e) {
      if (element.hasClass('left-aside-close')) {
        angular.element('body').toggleClass('open-left-aside');
      }
    });
  }
}