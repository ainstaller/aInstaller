//import {config} from '../config';
const storage = require('electron-json-storage');

export class SettingsController {
  constructor ($http, $log, $scope, $rootScope) {
    'ngInject';
    $rootScope.loading = false;

    $scope.save = function() {
      storage.set('settings', $rootScope.settings, function(error) {
        if (error) throw error;
      });
    };
  }
}
