//import {config} from '../config';

export class HudStylesController {
  constructor ($http, $log) {
    'ngInject';

    this.$http = $http;
    this.$log = $log;

    this.list = '#$%123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]abcdefghijklmnopqrstuvwxyz'.split('');
  }

  new() {
    this.creating = true;
  }

  setNewCrosshair(crosshair) {
    this.$log.debug(crosshair);
  }
}
