//import {config} from '../config';

export class HudCrosshairsController {
  constructor($http, $log, $scope) {
    'ngInject';

    if (typeof this.crosshairs === 'undefined') {
      this.crosshairs = {};
    }
    
    this.crosshairs.new = {
      crosshair: '#',
      enabled: true,
      size: 20,
      color: '#FFFFFF',
      outline: false,
      antialiasing: false,
      dmgFlash: false,
      dmgFlashColor: '#FFFFFF'
    };

    this.list = '#$%123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]abcdefghijklmnopqrstuvwxyz'.split('');

    this.onChange = function(event, color) {
      $log.debug(color);
    };

    this.onMove = function(event, color) {
      $log.debug(color);
    };

    var changed = $scope.$on('crosshairs:onChange', this.onChange);
    var moved = $scope.$on('crosshairs:onMove', this.onMove);
  }

  new() {
    this.creating = true;
  }

  setNewCrosshair(crosshair) {
    console.log(crosshair);
    this.crosshairs.new.crosshair = crosshair;
  }
}
