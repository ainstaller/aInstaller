export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('dashboard', {
      url: '/',
      templateUrl: 'app/dashboard/dashboard.html',
      controller: 'DashboardController',
      //controllerAs: 'dashboard'
    })
    .state('hud', {
      url: '/hud',
      templateUrl: 'app/hud/hud.html',
      controller: 'HudController',
      //controllerAs: 'hud'
    })
    .state('hud.crosshairs', {
      url: '/crosshairs',
      templateUrl: 'app/hud/crosshairs/crosshairs.html',
      controller: 'HudCrosshairsController',
      //controllerAs: 'crosshairs'
    })
    .state('hud.colors', {
      url: '/colors',
      templateUrl: 'app/hud/colors/colors.html',
      controller: 'HudColorsController',
    })
    .state('hud.styles', {
      url: '/styles',
      templateUrl: 'app/hud/styles/styles.html',
      controller: 'HudStylesController',
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'app/settings/settings.html',
      controller: 'SettingsController',
      //controllerAs: 'settings'
    });

  $urlRouterProvider.otherwise('/');
}
