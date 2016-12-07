import {config} from '../config';

export class DashboardController {
  constructor ($http, $log, $scope, $rootScope, $timeout, toasty) {
    'ngInject';

    $rootScope.hasChanges = function() {
      return ahud.isChanged($rootScope.backup, $rootScope.current());
    };

    $rootScope.$watch('loaded', function() {
      if ($rootScope.loaded == 3) {
        if (angular.isUndefined($rootScope.backup)) {
          $rootScope.backup = angular.copy($rootScope.current());
        }

        $scope.refresh(() => {
          $rootScope.loading = false;
        });
      }
    });

    $rootScope.current = function() {
      return {
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

      } else if ($scope.state === 'CHANGED') {
        ahud.remove(() => {
          console.log('removed');
          ahud.install($rootScope.current(), doneInstall);
        })
      } else if ($scope.state === 'NOT_INSTALLED') {
        ahud.install($rootScope.current(), doneInstall);

      } else if ($scope.state === 'UPDATE_AVAILABLE') {
        alert('update available');
      }
    };

    if ($rootScope.loaded == 3) {
      $scope.refresh(() => {
        $rootScope.loading = false;
      });
    }

    this.$http = $http;
    this.$log = $log;
    this.getNews();
  }

  getNews() {
    return;
    var self = this;
    let newsURL = 'http://steamcommunity.com/groups/ahud/rss';
    this.$http.get(newsURL).then(function(response) {
      //console.log(response.data);
      //self.onGetNews(response, self);
    }, this.onErr);

    //this.$http.get(config.API_URL + '/api/news').then(function(response) {
    //  self.onGetNews(response, self);
    //}, this.onErr);
  }

  onGetNews(response, self) {
    self.news = response.data;
    self.$log.debug(response.data);
  }

  onErr() {
    alert('Error: News can\'t be loaded, try again.');
  }
}
