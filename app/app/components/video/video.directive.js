export function VideoDirective() {
  'ngInject';

  let directive = {
    restrict: 'ECA',
    link: linkFunc
  };

  return directive;

  function linkFunc(scope, el) {
    angular.element(el).YTPlayer(); 
  }
}
