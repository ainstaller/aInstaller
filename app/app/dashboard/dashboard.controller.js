import {config} from '../config';

export class DashboardController {
  constructor ($http, $log, $scope, $rootScope, $timeout) {
    'ngInject';

    $scope.version = {
      current: 'not installed!',
      latest: ''
    };

    $scope.refresh = function() {
      ahud.latestVersion(() => {
        $scope.version.latest = ahud.latest.string();

        ahud.currentVersion(() => {
          $scope.version.current = ahud.current.string();
          $scope.state = ahud.state();
        });
      });
    };
    $scope.refresh();

    $scope.state = ahud.state();
    $scope.changeState = function() {
      if ($scope.state === 'INSTALLED') {
        ahud.remove(() => {
          console.log('removed');
          $timeout(function() {
            $scope.refresh();
          }, 1000);
        });

      } else {
        ahud.install({
          crosshairs: $rootScope.crosshairs,
          colors: $rootScope.colors
        }, () => {
          console.log('installed');
          $timeout(function() {
            $scope.refresh();
          }, 1000);
        });
      }
    };

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
