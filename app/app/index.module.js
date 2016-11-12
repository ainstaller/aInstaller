import { config } from './app/index.config';
import { routerConfig } from './app/index.route';
import { runBlock } from './app/index.run';

// controllers
import { DashboardController } from './app/dashboard/dashboard.controller';
import { HudController } from './app/hud/hud.controller';
import { HudCrosshairsController } from './app/hud/crosshairs/crosshairs.controller';
import { SettingsController } from './app/settings/settings.controller';

// directives
import { VideoDirective } from './app/components/video/video.directive';
import { ColorPickerDirective } from './app/components/colorPicker/colorPicker.directive';
import { ModalDirective } from './app/components/modal/modal.directive';

// factory
import { HudCrosshairsFactory } from './app/hud/crosshairs/crosshairs.factory';

angular.module('gui', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngMessages', 'ngAria', 'ngResource', 'ui.router', 'angular-toasty', 'angularSpectrumColorpicker'])
  .config(config)
  .config(routerConfig)
  .run(runBlock)
  .controller('DashboardController', DashboardController)
  .controller('HudController', HudController)
  .controller('HudCrosshairsController', HudCrosshairsController)
  .factory('HudCrosshairsFactory', HudCrosshairsFactory)
  .controller('SettingsController', SettingsController)
  .directive('apicker', ColorPickerDirective)
  .directive('modal', ModalDirective)
  .directive('aVideo', VideoDirective);
