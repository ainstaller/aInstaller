import {config} from '../config';
const storage = require('electron-json-storage');
var updaterAutoLauncher = require('../../startup');

export class DashboardController {
  constructor ($http, $log, $scope, $rootScope, $timeout, toasty) {
    'ngInject';

    $rootScope.hasChanges = function() {
      return ahud.isChanged($rootScope.backup, $rootScope.current());
    };

    $rootScope.$watch(() => ahud.loadingText, () => {
      $rootScope.loadingText = ahud.loadingText;
    });

    $rootScope.$watch('loaded', function() {
      if ($rootScope.loaded === true) {
        if (angular.isUndefined($rootScope.backup)) {
          $rootScope.backup = angular.copy($rootScope.current());
        }
        ahud.settings = $rootScope.settings;

        $scope.refresh(() => {
          $rootScope.loading = false;

          if (angular.isUndefined($rootScope.settings['auto_updater'])) {
            $rootScope.settings['auto_updater'] = true;
            updaterAutoLauncher.enable();
            
            storage.set('settings', $rootScope.settings, function(error) {
              if (error) throw error;
            });
          }
        });
      }
    });

    $rootScope.current = function() {
      return {
        background: $rootScope.settings.background,
        crosshairs: $rootScope.crosshairs,
        colors: $rootScope.colors,
        styles: $rootScope.styles
      };
    };

    $scope.version = {
      current: 'not installed!',
      latest: ''
    };

    $scope.refresh = function(cb) {
      var r = function() {
        ahud.latestVersion(() => {
          $scope.version.latest = ahud.latest.string();

          ahud.currentVersion(() => {
            $scope.version.current = ahud.current.string();
            $scope.state = ahud.state($rootScope.backup, $rootScope.current());
            console.log('CURRENT STATE -> ' + $scope.state);
            console.log('IS CHANGED ' + ahud.isChanged($rootScope.backup, $rootScope.current()));

            if (angular.isFunction(cb)) {
              cb();
            }
          });
        });
      };

      if (angular.isUndefined(ahud.steamPath)) {
        $scope.state = ahud.state($rootScope.backup, $rootScope.current());
        r();
      } else {
        $scope.state = ahud.state($rootScope.backup, $rootScope.current());
        r();
      }
    };

    var doneInstall = () => {
        console.log('installed');
        $timeout(function() {
          $rootScope.backup = angular.copy($rootScope.current());
          $scope.refresh(() => {
            $rootScope.loading = false;
          });

          toasty.success({
            title: "Dashboard",
            msg: "ahud is installed and up to date!",
            showClose: true,
            clickToClose: false,
            timeout: 5000,
            sound: false,
            html: false,
            shake: false,
            theme: "default"
          });
        }, 1000);
      };
    
    //$scope.state = ahud.state($rootScope.backup, $rootScope.current());
    $scope.changeState = function() {
      $rootScope.loading = true;

      if ($scope.state === 'INSTALLED') {
        ahud.remove(() => {
          console.log('removed');
          $timeout(function() {
            $scope.refresh(() => {
              $rootScope.loading = false;
            });

            toasty.warning({
              title: "Dashboard",
              msg: "ahud was removed from your tf2 directory!",
              showClose: true,
              clickToClose: false,
              timeout: 5000,
              sound: false,
              html: false,
              shake: false,
              theme: "default"
            });
          }, 1000);
        });

      } else if ($scope.state === 'CHANGED' || $scope.state === 'UPDATE_AVAILABLE') {
        ahud.remove(() => {
          console.log('removed');
          ahud.install($rootScope.current(), doneInstall);
        })
      } else if ($scope.state === 'NOT_INSTALLED') {
        ahud.install($rootScope.current(), doneInstall);
      }
    };

    if ($rootScope.loaded === true) {
      $scope.refresh(() => {
        $rootScope.loading = false;
      });
    }

    this.$http = $http;
    this.$log = $log;
  }
}
