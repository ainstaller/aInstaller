const storage = require('electron-json-storage');
const path = require('path');

export function runBlock($rootScope, $log, $interval) {
  'ngInject';
  $log.debug('runBlock end');

  $rootScope.crosshairScale = 3;
  $rootScope.colorpicker = {
    preferredFormat: 'rgb',
    showAlpha: true,
    showInput: true,
    allowEmpty: false,
    showPalette: true,
    showSelectionPalette: true,
    localStorageKey: 'ainstaller.colors',
    palette: [
      ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
      ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
      ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
      ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
      ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
      ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
      ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
      ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
    ]
  };

  // default settings
  $rootScope.settings = {
    video: true,
    video_url: path.join(__dirname, "background.mp4"),
  };

  $rootScope.loaded = false;
  storage.has('settings', function (error, has) {
    if (error) throw error;

    // load settings
    storage.getMany(['settings', 'crosshairs', 'colors', 'styles'], function (error, data) {
      if (error) throw error;

      $rootScope.crosshairs = data.crosshairs;

      // if (has) {
      // $rootScope.settings = data.settings;
      // } else {
      // $rootScope.settings = {
      //   video: true,
      //   video_url: require("./background.mp4"),
      // };
      // }

      $rootScope.colors = data.colors;
      $rootScope.styles = data.styles;
      $rootScope.loaded = true;
    });
  });



  $rootScope.sendEvent = function (name) {
    if (name === 'delete' || name === 'reset') {
      if (confirm('Do you really wanna ' + name + ' it?') === false) {
        return;
      }
    }

    $log.debug(name + ' event');
    $rootScope.$broadcast(name);
  };

  $rootScope.$watch('crosshairs', function () {
    if (angular.isObject($rootScope.crosshairs)) {
      $rootScope.totalCrosshairs = Object.keys($rootScope.crosshairs).length;
    } else {
      $rootScope.totalCrosshairs = 0;
    }
  }, true);


  var randomNumber = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  $interval(function () {
    if (angular.isUndefined($rootScope.color)) {
      return;
    }

    if ($rootScope.color.damage || $rootScope.color.healing) {
      $rootScope.randomDamage = randomNumber(30, 100);
      $rootScope.randomDamageLeft = randomNumber(0, 600);
      $rootScope.randomDamageRight = randomNumber(0, 600);
      $rootScope.randomDamageTop = randomNumber(0, 600);
      $rootScope.randomDamageBottom = randomNumber(0, 600);
    }
  }, 3000);
}
