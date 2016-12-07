//import {config} from '../config';
const storage = require('electron-json-storage');

export class HudStylesController {
  constructor ($log, $scope, $rootScope, toasty) {
    'ngInject';

    if (angular.isUndefined($rootScope.styles)) {
      $rootScope.styles = {};
    }

    $scope.save = function() {
      storage.set('styles', $rootScope.styles, (error) => {
        if (error) throw err;

        toasty.success({
          title: "Styles",
          msg: "Style saved!",
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
