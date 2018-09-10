//import {config} from '../config';
const storage = require('electron-json-storage');
import Parser from 'rss-parser';
var parser = new Parser();

export class HudNewsController {
  constructor ($log, $scope, $rootScope, toasty) {
    'ngInject';
    
    $rootScope.loading = true;
    $rootScope.loadingText = "Loading ahud's news...";
    let newsURL = 'http://steamcommunity.com/groups/ahud/rss';
    parser.parseURL(newsURL, function(err, feed) {
      $rootScope.loading = false;
      $rootScope.loadingText = "";
      
      $scope.news = [];
      feed.items.forEach(item => {
        console.log(item);
        $scope.news.push(item);
      });
    });
  }
}
