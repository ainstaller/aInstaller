import {config} from '../config';

class Settings() {
  constructor($http, $rootScope, toasty) {
    this.$http = $http;
    this.toasty = toasty;
  }

  set(data) {
    $http
      .post(config.API_URL + '/api/settings', data)
      .then(this.onSaved, this.onError('saving'));
  }

  onSaved() {
    this.toasty.success({
      title: 'Settings',
      msg: 'Your settings were saved!'
    });
  }

  onLoaded(data) {
    $rootScope.settings = data;
  }

  load(data) {
    $http
      .get(config.API_URL + '/api/settings', data)
      .then(this.onLoaded, this.onError('loading'));
  }

  onError(err) {
    return (function() {
      alert('Error on ' + err + ' user\'s settings');
    });
  }
}

export function SettingsFactory($http, $rootScope, $log) {
  'ngInject';

  var settings = new Settigns($http);
  settings.load();

  return settings;
}
