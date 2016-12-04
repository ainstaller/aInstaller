export function FlashDirective($interval, $timeout) {
  'ngInject';

  let directive = {
    restrict: 'ECA',
    link: linkFunc,
    scope: {
      enabled: '=',
      start: '=',
      end: '='
    }
  };

  return directive;

  function linkFunc(scope, el, attrs) {
    var switcher = false;
    var mi;

    var run = function() {
      mi = $interval(function() {
        console.log('interval ' + switcher + ' - ' + (switcher ? scope.start : scope.end).color);
        angular.element(el).animate({
          'background-color': (switcher ? scope.start : scope.end).color,
        }, 150);

        switcher = !switcher;
      }, 300);
    };

    var stop = function() {
      $interval.cancel(mi);

      $timeout(function() {
        angular.element(el).removeAttr('style');
        console.log('clearing');
      }, 301);
    };

    scope.$watch('enabled', function() {
      if (scope.enabled === true) {
        run();
      } else {
        stop();
      }
    });

    scope.$on('$destroy', function() {
      stop();
    });
  }
}
