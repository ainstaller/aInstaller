//import {config} from '../config';
const storage = require('electron-json-storage');

export class HudColorsController {
  constructor ($http, $log, $scope, $rootScope) {
    'ngInject';

    $log.debug('colors');
    $rootScope.hideHudMenu = true;
    $scope.color = {
      current: '',
      color: '',
    };

    var oldColor = '';
    $scope.$watch('color.current', function() {
      if($scope.color.current === '') {
        return;
      }

      if (angular.isUndefined($rootScope.colors[$scope.color.current])) {
        $rootScope.colors[$scope.color.current] = {
          color: '',
        };
      }

      oldColor = $rootScope.colors[$scope.color.current].color;
      $scope.color.color = $rootScope.colors[$scope.color.current].color;
      $rootScope.colors[$scope.color.current].color = $scope.color.color;

      // hud elements trigger
      if (angular.isUndefined($rootScope.color)) {
        $rootScope.color = {};
      }

      // currently editing
      $rootScope.color.healing = $scope.color.current === 'healing';
      $rootScope.color.damage = $scope.color.current === 'damage';
      $rootScope.color.buff = $scope.color.current === 'hp_buff';
      $rootScope.color.low = $scope.color.current === 'hp_low';
    });

    $scope.$watch('color.color', function() {
      if ($scope.color.color == '') {
        return;
      }

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
      $rootScope.colors[$scope.color.current].color = $scope.color.color = '255 255 255 255';
    });
  }
}
