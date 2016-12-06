//import {config} from '../config';
const storage = require('electron-json-storage');

export class HudColorsController {
  constructor ($http, $log, $scope, $rootScope, toasty) {
    'ngInject';

    var colorsName = {
      'hp': 'HP',
      'hp_buff': 'HP Buff',
      'hp_low': 'HP Low',
      'damage': 'Damage Numbers',
      'healing': 'Healing Numbers',
      'ammo': 'Ammo In Clip',
      'ammo_reserve': 'Ammo In Reserve',
      'low_ammo_flash_start': 'Low Ammo Flash Start',
      'low_ammo_flash_end': 'Low Ammo Flash End',
      'stickies': 'Stickies (Demoman)',
      'metal': 'Metal (Engineer)',
      'killstreak': 'KillStreak',
      'charge_percent': 'Charge Percentage (Medic)',
      'ubercharge_meter': 'Ubercharge Meter (Medic)',
      'ubercharge_flash_start': 'Ubercharge Flash Start (Medic)',
      'ubercharge_flash_end': 'Ubercharge Flash End (Medic)'
    };

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
      $rootScope.color.medic_flash = $scope.color.current.indexOf('ubercharge_flash') === 0;
      $rootScope.color.stickies = $scope.color.current === 'stickies';
      $rootScope.color.no_clip = $scope.color.current === 'ammo_no_clip';
      $rootScope.color.healing = $scope.color.current === 'healing';
      $rootScope.color.damage = $scope.color.current === 'damage';
      $rootScope.color.medic = $rootScope.color.medic_flash || 
        $scope.color.current === 'charge_percent' ||
        $scope.color.current === 'ubercharge_meter';
      $rootScope.color.metal = $scope.color.current === 'metal';
      $rootScope.color.buff = $scope.color.current === 'hp_buff';
      $rootScope.color.low = $scope.color.current === 'hp_low' || 
        $scope.color.current === 'low_ammo_flash_start' ||
        $scope.color.current === 'low_ammo_flash_end';
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

        toasty.success({
          title: "Color",
          msg: colorsName[$scope.color.current] + "'s color was saved!",
          showClose: true,
          clickToClose: false,
          timeout: 5000,
          sound: false,
          html: false,
          shake: false,
          theme: "default"
        });
      });
    });

    $scope.$on('cancel', function() {
      $rootScope.colors[$scope.color.current].color = oldColor;

      toasty.warning({
        title: "Color",
        msg: colorsName[$scope.color.current] + "'s changes was canceled!",
        showClose: true,
        clickToClose: false,
        timeout: 5000,
        sound: false,
        html: false,
        shake: false,
        theme: "default"
      });
    });

    $scope.$on('reset', function() {
      $rootScope.colors[$scope.color.current].color = $scope.color.color = '255 255 255 255';
      
      toasty.warning({
        title: "Color",
        msg: colorsName[$scope.color.current] + "'s color was reset!",
        showClose: true,
        clickToClose: false,
        timeout: 5000,
        sound: false,
        html: false,
        shake: false,
        theme: "default"
      });
    });
  }
}
