const storage = require('electron-json-storage');

export function runBlock ($rootScope, $log) {
  'ngInject';
  $log.debug('runBlock end');

  storage.get('crosshairs', function(error, data) {
    if (error) throw error;

    $rootScope.crosshairs = data;
  });

  $rootScope.sendEvent = function(name) {
    if (name === 'delete') {
      if (confirm('Do you really wanna delete it?') === false) {
        return;
      }
    }

    $log.debug(name + ' event');
    $rootScope.$broadcast(name);
  };

  $rootScope.$watch('crosshairs', function() {
    if (angular.isObject($rootScope.crosshairs)) {
      $rootScope.totalCrosshairs = Object.keys($rootScope.crosshairs).length;
    } else {
      $rootScope.totalCrosshairs = 0;
    }


    //localStorage.setItem('crosshairs', JSON.stringify($rootScope.crosshairs));
  }, true);
}
