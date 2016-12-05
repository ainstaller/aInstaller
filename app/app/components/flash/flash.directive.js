export function FlashDirective($interval, $timeout) {
  'ngInject';

  let directive = {
    restrict: 'ECA',
    link: linkFunc,
    scope: {
      enabled: '=',
      start: '=',
      mode: '@',
      end: '='
    }
  };

  return directive;

  function linkFunc(scope, el, attrs) {
    var start = angular.isDefined(scope.start) ? scope.start.color : '';
    var end = angular.isDefined(scope.end) ? scope.end.color : '';

    var switcher = false;
    var mi;

    var run = function() {
      mi = $interval(function() {
        angular.element(el).animate({
          'background-color': switcher ? start : end,
        }, 150);

        switcher = !switcher;
      }, 300);
    };

    var stop = function(cb) {
      $interval.cancel(mi);

      $timeout(function() {
        angular.element(el).removeAttr('style');

        if (angular.isFunction(cb)) {
          cb();
        }
      }, 301);
    };

    scope.$watch('enabled', function() {
      if (scope.enabled === true) {
        run();
      } else {
        stop();
      }
    });

    scope.$watch('start', function() {
      if (angular.isDefined(scope.start)) {
        start = scope.start.color;

        if (angular.isDefined(scope['mode']) && scope['mode'] === 'alpha') {
          start = angular.element.Color(scope.start.color).transition('transparent', 0.3).toRgbaString();
        }
      }
    }, true);

    scope.$watch('end', function() {
      if (angular.isDefined(scope.end)) {
        end = scope.end.color;

        if (angular.isDefined(scope['mode']) && scope['mode'] === 'alpha') {
          end = angular.element.Color(scope.end.color).transition('transparent', 0.4).toRgbaString();
        }
      }
    }, true);

    scope.$on('$destroy', function() {
      stop();
    });
  }
}
