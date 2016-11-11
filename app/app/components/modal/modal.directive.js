export class ModalController {
  constructor() {
  }
}

export function ModalDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    link: linkFunc,
    transclude: true,
    controller: ModalController,
    controllerAs: 'vm',
    templateUrl: 'app/components/modal/modal.html',
    bindToController: true
  };

  return directive;

  function linkFunc(scope, el, attrs, vm) {
    angular.element(attrs.trigger).bind('click', function() {
      angular.element(el).children('.modal').toggleClass('show');
      angular.element('body > .content > .sidebar').toggleClass('hide');
      angular.element('body > .content > .page').toggleClass('hide');
    });

    vm.hide = function() {
      angular.element(el).children('.modal').toggleClass('show');
      angular.element('body > .content > .sidebar').toggleClass('hide');
      angular.element('body > .content > .page').toggleClass('hide');
    };
  }
}
