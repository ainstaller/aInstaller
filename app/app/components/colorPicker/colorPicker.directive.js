export function ColorPickerDirective() {
  'ngInject';

  let directive = {
    restrict: 'ECA',
    link: linkFunc
  };

  return directive;

  function linkFunc(scope, el, attrs) {
    angular.element(el).spectrum({
      change: function(color) {
        scope.$emit(attrs.onchange, color);
        angular.element(el).hide();
      },
      move: function(color) {
        scope.$emit(attrs.onmove, color);
      },
      preferredFormat: 'rgba',
      showAlpha: true,
      showPalette: true,
      showSelectionPalette: true,
      localStorageKey: 'ainstaller.colors',
      palette: [
        ['black', 'white', 'blanchedalmond'],
        ['rgb(255, 128, 0);', 'hsv 100 70 50', 'lightyellow']
      ]
    });
    //change: function(color) {
    //  color.toHexString(); // #ff0000
    //}
  }
}
