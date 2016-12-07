import {config} from '../config';

export class DashboardController {
  constructor ($http, $log, $scope, $rootScope, $timeout, toasty) {
    'ngInject';

    $scope.version = {
      current: 'not installed!',
      latest: ''
    };

    $scope.refresh = function(cb) {
      ahud.latestVersion(() => {
        $scope.version.latest = ahud.latest.string();

        ahud.currentVersion(() => {
          $scope.version.current = ahud.current.string();
          $scope.state = ahud.state();

          if (typeof cb !== 'undefined') {
            cb();
          }
        });
      });
    };

    $scope.state = ahud.state();
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

      } else {
        ahud.install({
          crosshairs: $rootScope.crosshairs,
          colors: $rootScope.colors,
          styles: $rootScope.styles
        }, () => {
          console.log('installed');
          $timeout(function() {
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
        });
      }
    };

    $scope.refresh(() => {
      $rootScope.loading = false;
    });

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
