//import {config} from '../config';
const storage = require('electron-json-storage');

export class SettingsController {
  constructor ($http, $log, $scope, $rootScope, toasty) {
    'ngInject';
    $rootScope.loading = false;

    $scope.save = function() {
      storage.set('settings', $rootScope.settings, function(error) {
        if (error) throw error;

        toasty.success({
          title: "Settings",
          msg: "Settings saved!",
          showClose: true,
          clickToClose: false,
          timeout: 5000,
          sound: false,
          html: false,
          shake: false,
          theme: "default"
        });
      });
    };
  }
}
