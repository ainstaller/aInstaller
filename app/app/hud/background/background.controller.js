//import {config} from '../config';
import {remote} from 'electron';
import fs from 'fs';
const storage = require('electron-json-storage');

export class HudBackgroundController {
  constructor($http, $log, $scope, $rootScope, toasty) {
    'ngInject';

    if (!angular.isObject($rootScope.settings.background)) {
      $rootScope.settings.background = {
        enabled: false,
        data: '',
      };
    }

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

    $scope.change = function() {
      remote.dialog.showOpenDialog({
        filters: [
          {name: '*.jpg', extensions: ['jpg']},
          {name: '*.png', extensions: ['png']},
        ],
        properties: ['openFile']
      }, (f) => {
        $rootScope.settings.background.path = f[0];
        console.log(f);
        var img = fs.readFileSync($rootScope.settings.background.path);
        var bimg = new Buffer(img).toString('base64');
        $rootScope.settings.background.data = bimg;

        $scope.save();
      });
    };
  }
}
