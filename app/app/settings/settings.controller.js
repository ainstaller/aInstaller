//import {config} from '../config';
import {remote} from 'electron';
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

    $scope.choose = function() {
      remote.dialog.showOpenDialog({
        filters: [
          {name: 'hl2.exe', extensions: ['exe']},
        ],
        properties: ['openFile']
      }, (f) => {
        $rootScope.settings.hl2 = f[0];
        $scope.save();
      });
    };

    $scope.restore = function() {
      if ($rootScope.settings.hl2 !== '') {
        return;
      }

      ahud.getSteamPath(() => {
        toasty.warning({
          title: "Settings",
          msg: "Auto steam path restored!",
          showClose: true,
          clickToClose: false,
          timeout: 5000,
          sound: false,
          html: false,
          shake: false,
          theme: "default"
        });

        $scope.save();
      });
    };
  }
}
