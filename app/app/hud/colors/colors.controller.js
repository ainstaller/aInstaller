//import {config} from '../config';
const storage = require('electron-json-storage');

export class HudColorsController {
  constructor ($http, $log, $scope, $rootScope) {
    'ngInject';

    $log.debug('colors');
    $rootScope.hideHudMenu = true;
    //colors.[color.current].color
    $scope.color = {
      current: '',
      color: '',
    };

    var oldColor = '';
    $scope.$watch('color.current', function() {
      if (angular.isUndefined($rootScope.colors[$scope.color.current])) {
        $rootScope.colors[$scope.color.current] = {
          color: '',
        };
      }

      oldColor = $rootScope.colors[$scope.color.current].color;
      $scope.color.color = $rootScope.colors[$scope.color.current].color;
      $rootScope.colors[$scope.color.current].color = $scope.color.color;
    });

    $scope.$watch('color.color', function() {
      $rootScope.colors[$scope.color.current].color = $scope.color.color;
    });
  
    $scope.$on('save', function() {
      $rootScope.colors[$scope.color.current].color = $scope.color.color;

      storage.set('colors', $rootScope.colors, function(error) {
        if (error) throw error;
      });
    });

    $scope.$on('cancel', function() {
      $rootScope.colors[$scope.color.current].color = oldColor;
    });

    $scope.$on('reset', function() {
      $rootScope.colors[$scope.color.current].color = $scope.color.color;
    });
  }
}
