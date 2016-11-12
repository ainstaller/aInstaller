//import {config} from '../config';

class factory {
  constructor ($rootScope) {
    'ngInject';

    this.$rootScope = $rootScope;
    this.list = '#$%123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]abcdefghijklmnopqrstuvwxyz'.split('');

    return {
      listen: this.listen
    };
  }

  listen(onChange, onMove) {
    var changed = this.$rootScope.$on('crosshairs:onColorChange', onChange);
    var moved = this.$rootScope.$on('crosshairs:onColorMove', onMove);

    return {
      changed: changed,
      moved: moved
    };
  }
}

export default { 
  'HudCrosshairsFactory': ['$rootScope', ($rootScope) => new factory($rootScope)]
};
