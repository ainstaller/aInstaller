//import {config} from '../config';
const storage = require('electron-json-storage');

export class HudCrosshairsController {
  constructor($http, $log, $scope, $rootScope) {
    'ngInject';

    if (!angular.isObject($rootScope.crosshairs)) {
      $rootScope.crosshairs = {};
    }
    
    $rootScope.list = '#$%123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]abcdefghijklmnopqrstuvwxyz'.split('');

    this.onChange = function(event, color) {
      $log.debug('change ' + color);
    };

    this.onMove = function(event, color) {
      $log.debug(color);
    };

    var hide = function(hide) {
      $scope.creating = hide;
      $rootScope.editMode = hide;
      $rootScope.hideHudMenu = hide;
      $rootScope.hideHudCrosshairMenu = hide;
    };

    var changed = $scope.$on('crosshairs:onColorChange', this.onChange);
    var moved = $scope.$on('crosshairs:onColorMove', this.onMove);

    $scope.setNewCrosshair = function(crosshair) {
      $log.debug('setNewCrosshair: ' + crosshair);
      $rootScope.crosshairs.current.crosshair = crosshair;
    };

    $scope.creating = false;
    $scope.newCrosshair = function() {
      $rootScope.crosshairs.current = {
        id: 'new',
        crosshair: $rootScope.list[0],
        enabled: true,
        size: 20,
        color: 'rgba(255, 255, 255, 255)',
        outline: false,
        antialiasing: false,
        dmgFlash: false,
        dmgFlashColor: 'rgba(255, 255, 255, 255)'
      };

      hide(true);
    };

    $scope.editCrosshair = function(id) {
      $scope.newCrosshair();
      $rootScope.crosshairs.current = $rootScope.crosshairs[id];
    };

    $scope.removeCrosshair = function(id) {

    };

    $scope.onSizeChange = function() {
      $rootScope.crosshairs.current.size = $rootScope.crosshairs.current.size.replace(/\D/g,'');
    };

    $scope.onSizeChangeBlur = function () {
      if ($rootScope.crosshairs.current.size < 10) {
        $rootScope.crosshairs.current.size = 10;

      } else if ($rootScope.crosshairs.current.size > 50) {
        $rootScope.crosshairs.current.size = 50;
      }
    };

    $scope.$on('save', function() {
      if ($rootScope.crosshairs.current.id === 'new') {
        $rootScope.crosshairs.current.id = (new Date()).getTime();
      }

      $rootScope.crosshairs[$rootScope.crosshairs.current.id] = $rootScope.crosshairs.current;
      delete $rootScope.crosshairs.current;

      storage.set('crosshairs', $rootScope.crosshairs, function(error) {
        if (error) throw error;
      });

      hide(false);
    });

    $scope.$on('cancel', function() {
      hide(false);
    });

    $scope.$on('delete', function() {
      delete $rootScope.crosshairs[$rootScope.crosshairs.current.id];
      delete $rootScope.crosshairs.current;

      storage.set('crosshairs', $rootScope.crosshairs, function(error) {
        if (error) throw error;
      });

      hide(false);
    });
  }
}
