export function VideoDirective($timeout, $rootScope) {
  'ngInject';

  let directive = {
    restrict: 'ECA',
    link: linkFunc
  };

  return directive;

  function linkFunc(scope, el) {
    if (scope.settings.video === false) {
      return;
    }

    var options = {
      videoURL: 'https://www.youtube.com/watch?v=3YBsmwZi56s', 
      showControls: false, 
      quality: 'highres', 
      autoPlay: true, 
      optimizeDisplay: true, 
      mute: true, 
      startAt: 0,
      opacity: 1, 
      align: 'center, center'
    };

    scope.$watch('settings.video_url', function() {
      if (angular.isDefined(scope.settings.video_url) && scope.settings.video_url.length > 0) {
        $timeout(function() {
          options.videoURL = scope.settings.video_url;
          if (angular.element('#bgvideo').hasClass('mb_YTPlayer')) {
            angular.element('#bgvideo').YTPChangeMovie(options);
          } else {
            angular.element(el).YTPlayer(options);
          }
        }, 1000);
      }
    });

    scope.$watch('settings.video', function() {
      if ($rootScope.settings.video === true) {
        $timeout(function() {
          angular.element(el).YTPPlay();
          angular.element('.mbYTP_wrapper').show();
        }, 1000);
      } else {
        $timeout(function() {
          angular.element(el).YTPPause();
          angular.element('.mbYTP_wrapper').hide();
        }, 1000);
      }
    });
  }
}
